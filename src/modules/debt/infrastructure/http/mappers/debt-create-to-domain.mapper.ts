import type { DebtCreateSchema } from "#debt/infrastructure/http/schemas/debt-create.schema.js";
import type { DebtCreateDTO } from "#debt/application/dto/debt-create.dto.js";

export function debtCreateToDomainMapper(
  data: DebtCreateSchema,
): DebtCreateDTO {
  return {
    partyId: data.debt.partyId,
    type: data.debt.type,
    description: data.debt.description,
    amount: data.debt.amount,
  };
}
