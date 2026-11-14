import type { DebtStatus } from "#debt/domain/entities/debt.entity.js";

export interface PrismaDebtRow {
  id: number;
  creatorId: string;
  debtorId: string;
  creditorId: string | null;
  reconciledIntoId: number | null;
  description: string;
  amount: string;
  isSettled: boolean;
  isConfirmed: boolean | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PrismaDebtCreateRow {
  creatorId: string;
  debtorId: string;
  creditorId: string | null;
  description: string;
  amount: string;
}
