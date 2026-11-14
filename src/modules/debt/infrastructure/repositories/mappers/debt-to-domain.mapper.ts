import type { PrismaDebtRow } from "#debt/infrastructure/repositories/types/debt.types.js";
import { Debt } from "#debt/domain/entities/debt.entity.js";

export function debtToDomainMapper(data: PrismaDebtRow): Debt {
  return Debt.reconstitute({
    id: data.id,
    debtorId: data.debtorId,
    creatorId: data.creatorId,
    creditorId: data.creditorId,
    reconciledIntoId: data.reconciledIntoId,
    amount: data.amount,
    description: data.description,
    isSettled: data.isSettled,
    isConfirmed: data.isConfirmed,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
}
