import type { DebtIdentitySchema } from "#debt/infrastructure/http/schemas/debt-identity.schema.js";
import type { DebtIdentityDTO } from "#debt/application/dto/debt-identity.dto.js";

export function debtIdentityToDomainMapper(
  data: DebtIdentitySchema,
): DebtIdentityDTO {
  return {
    id: data.id,
  };
}
