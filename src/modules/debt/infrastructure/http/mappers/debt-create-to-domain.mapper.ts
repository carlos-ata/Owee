import type { DebtCreateSchema } from "#debt/infrastructure/http/schemas/debt-create.schema.js";
import type { DebtCreateDTO } from "#debt/application/dto/debt-create.dto.js";

export function debtCreateToDomainMapper(
  data: DebtCreateSchema,
): DebtCreateDTO {
  return {
    debtorId: data.debt.debtorId,
    creditorId: data.debt.creditorId ?? null,
    description: data.debt.description,
    amount: data.debt.amount,
  };
}
