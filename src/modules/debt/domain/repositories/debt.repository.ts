import type {
  Debt,
  NewDebtData,
  DebtCancelData,
  DebtIdentityProps,
} from "#debt/domain/entities/debt.entity.js";

export interface IDebtRepository {
  create(debt: NewDebtData): Promise<Debt>;
  findById(id: number): Promise<Debt>;
  cancel(debt: DebtCancelData): Promise<void>;
  confirm(debt: DebtIdentityProps): Promise<Debt>;
}
