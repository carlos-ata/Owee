import type { IDebtRepository } from "#debt/domain/repositories/debt.repository.js";
import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";
import { Debt } from "#debt/domain/entities/debt.entity.js";

import type { DebtIdentityDTO } from "#debt/application/dto/debt-identity.dto.js";

interface Deps {
  debtRepository: IDebtRepository;
}

export default class DebtCancelUseCase {
  private readonly debtRepository: IDebtRepository;

  constructor(deps: Deps) {
    this.debtRepository = deps.debtRepository;
  }

  async execute(user: User, data: DebtIdentityDTO): Promise<void> {
    const resDebtExists = await this.debtRepository.findById(data.id);
    if (resDebtExists.creatorId !== user.id) {
      throw error.forbidden("No tienes permitido realizar esta accion");
    }
    const debt = Debt.cancel(data);
    await this.debtRepository.cancel(debt);
  }
}
