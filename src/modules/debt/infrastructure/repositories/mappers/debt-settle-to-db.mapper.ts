import type { DebtSettleData } from "#debt/domain/entities/debt.entity.js";

export function debtSettleToDbMapper(data: DebtSettleData) {
  return {
    isSettled: data.isSettled,
    updatedAt: data.updatedAt,
  };
}
