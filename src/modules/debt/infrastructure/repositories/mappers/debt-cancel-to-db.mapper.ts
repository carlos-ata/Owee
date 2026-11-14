import type { DebtCancelData } from "#debt/domain/entities/debt.entity.js";

export function debtCancelToDbMapper(data: DebtCancelData) {
  return {
    status: data.status,
    updatedAt: data.updatedAt,
  };
}
