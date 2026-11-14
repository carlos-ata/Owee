import type { NewDebtData } from "#debt/domain/entities/debt.entity.js";

import type { Numeric } from "@prisma/orm-postgres/target/codec-types";

export function debtCreateToDbMapper(data: NewDebtData) {
  return {
    debtorId: data.debtorId,
    creatorId: data.creatorId,
    creditorId: data.creditorId,
    amount: data.amount as Numeric<12, 2>,
    description: data.description,
    isSettled: data.isSettled,
    isConfirmed: data.isConfirmed,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
