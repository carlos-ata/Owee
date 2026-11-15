import type { IDebtRepository } from "#debt/domain/repositories/debt.repository.js";
import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";
import { Debt, DebtType } from "#debt/domain/entities/debt.entity.js";
import type { DebtCreateDTO } from "#debt/application/dto/debt-create.dto.js";

interface Deps {
  debtRepository: IDebtRepository;
  authRepository: IAuthRepository;
}

export default class DebtCreateUseCase {
  private readonly debtRepository: IDebtRepository;
  private readonly authRepository: IAuthRepository;

  constructor(deps: Deps) {
    this.debtRepository = deps.debtRepository;
    this.authRepository = deps.authRepository;
  }

  async execute(user: User, data: DebtCreateDTO): Promise<Debt> {
    if (data.type === DebtType.RECEIVABLE && !data.partyId) {
      throw error.badRequest("El id de la parte es obligatorio");
    }

    if (data.partyId) {
      if (data.partyId === user.id)
        throw error.badRequest(
          "El id de la parte no puede ser el mismo que el del creador",
        );

      const validPartyUser = await this.authRepository.findById(data.partyId);
      if (!validPartyUser)
        throw error.notFound("El usuario de la otra parte no existe");
    }

    let debtorId: string;
    let creditorId: string | null;

    if (data.type === DebtType.PAYABLE) {
      debtorId = user.id;
      creditorId = data.partyId;
    } else if (data.type === DebtType.RECEIVABLE) {
      debtorId = data.partyId!;
      creditorId = user.id;
    } else {
      throw error.badRequest("Tipo de deuda inválido");
    }

    const debt = Debt.create({
      ...data,
      creatorId: user.id,
      debtorId,
      creditorId,
    });
    const resDebt = await this.debtRepository.create(debt);
    return resDebt;
  }
}
