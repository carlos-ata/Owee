import type { BalanceRow } from "#balance/infrastructure/repositories/types/balance.types.js";
import { Balance } from "#balance/domain/entities/balance.entity.js";

export function balanceToDomainMapper(row: BalanceRow): Balance {
  return Balance.reconstitute({
    payableAmount: Number(row.payable_amount),
    receivableAmount: Number(row.receivable_amount),
    payableCount: Number(row.payable_count),
    receivableCount: Number(row.receivable_count),
  });
}
