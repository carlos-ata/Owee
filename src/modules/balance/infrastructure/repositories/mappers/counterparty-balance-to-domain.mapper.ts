import type { CounterpartyBalanceRow } from "#balance/infrastructure/repositories/types/counterparty-balance.types.js";
import { CounterpartyBalance } from "#balance/domain/entities/counterparty-balance.entity.js";

export function counterpartyBalanceToDomainMapper(
  rows: CounterpartyBalanceRow[],
): CounterpartyBalance[] {
  return rows.map((row) =>
    CounterpartyBalance.reconstitute({
      personId: row.person_id,
      personName: row.person_name,
      payableAmount: row.payable_amount,
      receivableAmount: row.receivable_amount,
      concepts: row.concepts?.split(","),
    }),
  );
}
