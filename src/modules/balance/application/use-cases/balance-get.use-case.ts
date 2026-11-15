import type { IBalanceRepository } from "#balance/domain/repositories/balance.repository.js";

import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";
import type { Balance } from "#balance/domain/entities/balance.entity.js";

interface Deps {
  balanceRepository: IBalanceRepository;
}

export default class BalanceGetUseCase {
  private readonly balanceRepository: IBalanceRepository;

  constructor(deps: Deps) {
    this.balanceRepository = deps.balanceRepository;
  }
  async execute(user: User): Promise<Balance> {
    const balance = await this.balanceRepository.getBalance(user.id);
    return balance;
  }
}
