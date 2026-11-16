import type { Balance } from "#balance/domain/entities/balance.entity.js";
import type { CounterpartyBalance } from "#balance/domain/entities/counterparty-balance.entity.js";

export interface IBalanceRepository {
  getBalance(userId: string): Promise<Balance>;
  getBalanceByPerson(userId: string): Promise<CounterpartyBalance[]>;
}
