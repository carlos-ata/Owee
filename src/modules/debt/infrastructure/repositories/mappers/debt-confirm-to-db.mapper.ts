import type { DebtConfirmData } from "#debt/domain/entities/debt.entity.js";

export function debtConfirmToDbMapper(data: DebtConfirmData) {
  return {
    isConfirmed: data.isConfirmed,
    updatedAt: data.updatedAt,
  };
}
