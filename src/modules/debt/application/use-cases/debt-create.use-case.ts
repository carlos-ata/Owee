import type { IDebtRepository } from "#debt/domain/repositories/debt.repository.js";
import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";
import { Debt } from "#debt/domain/entities/debt.entity.js";
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
    const validDebtorUser = await this.authRepository.findById(data.debtorId);
    if (!validDebtorUser) {
      throw error.notFound("El usuario deudor no existe");
    }

    if (data.creditorId) {
      const validCreditorUser = await this.authRepository.findById(
        data.creditorId,
      );
      if (!validCreditorUser) {
        throw error.notFound("El usuario acreedor no existe");
      }
      const isDebtorCreditorSameUser =
        validDebtorUser.id === validCreditorUser.id;
      if (isDebtorCreditorSameUser) {
        throw error.badRequest(
          "El usuario deudor y acreedor no pueden ser el mismo",
        );
      }
    }

    const isUserInDebtorCreditor = [data.debtorId, data.creditorId].includes(
      user.id,
    );
    if (!isUserInDebtorCreditor) {
      throw error.badRequest("El usuario no es deudor ni acreedor");
    }

    const debt = Debt.create({ ...data, creatorId: user.id });
    const resDebt = await this.debtRepository.create(debt);
    return resDebt;
  }
}
