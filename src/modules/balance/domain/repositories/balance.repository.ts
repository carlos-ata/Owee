import type { Balance } from "#balance/domain/entities/balance.entity.js";

export interface IBalanceRepository {
  getBalance(userId: string): Promise<Balance>;
}
