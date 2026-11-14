import type { Debt } from "#debt/domain/entities/debt.entity.js";

export function debtGenericToResponseMapper(data: Debt) {
  return {
    id: data.id,
  };
}
