import type { IBalanceRepository } from "#balance/domain/repositories/balance.repository.js";

import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";
import type { CounterpartyBalance } from "#balance/domain/entities/counterparty-balance.entity.js";

interface Deps {
  balanceRepository: IBalanceRepository;
}

export default class BalanceGetUseCase {
  private readonly balanceRepository: IBalanceRepository;

  constructor(deps: Deps) {
    this.balanceRepository = deps.balanceRepository;
  }
  async execute(user: User): Promise<CounterpartyBalance[]> {
    const counterpartyBalance = await this.balanceRepository.getBalanceByPerson(
      user.id,
    );
    return counterpartyBalance;
  }
}
