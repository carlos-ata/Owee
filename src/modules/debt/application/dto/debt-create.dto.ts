import type { DebtType } from "#debt/domain/entities/debt.entity.js";

export interface DebtCreateDTO {
  partyId: string | null;
  type: DebtType;
  description: string;
  amount: string;
}
