import type { db as DbInstance } from "#prisma/db.js";
import type { IDebtRepository } from "#debt/domain/repositories/debt.repository.js";

import { error } from "#domain/errors/app-error.js";

import type {
  Debt,
  NewDebtData,
  DebtSettleData,
  DebtConfirmData,
  DebtCancelData,
} from "#debt/domain/entities/debt.entity.js";

import { debtCreateToDbMapper } from "#debt/infrastructure/repositories/mappers/debt-create-to-db.mapper.js";
import { debtSettleToDbMapper } from "#debt/infrastructure/repositories/mappers/debt-settle-to-db.mapper.js";
import { debtConfirmToDbMapper } from "#debt/infrastructure/repositories/mappers/debt-confirm-to-db.mapper.js";
import { debtCancelToDbMapper } from "#debt/infrastructure/repositories/mappers/debt-cancel-to-db.mapper.js";

import { debtToDomainMapper } from "#debt/infrastructure/repositories/mappers/debt-to-domain.mapper.js";

interface Deps {
  db: typeof DbInstance;
}

export default class PgSqlDebtRepository implements IDebtRepository {
  private readonly db: typeof DbInstance;

  constructor(deps: Deps) {
    this.db = deps.db;
  }

  async create(data: NewDebtData): Promise<Debt> {
    const debt = await this.db.orm.public.Debt.create(
      debtCreateToDbMapper(data),
    );
    return debtToDomainMapper(debt);
  }

  async findById(id: number): Promise<Debt> {
    const debt = await this.db.orm.public.Debt.where({ id }).first();
    if (!debt) {
      throw error.notFound("Deuda no encontrada");
    }
    return debtToDomainMapper(debt);
  }

  async cancel(data: DebtCancelData): Promise<void> {
    const debt = await this.db.orm.public.Debt.where({
      id: data.id,
    }).update(debtCancelToDbMapper(data));
    if (!debt) {
      throw error.notFound("Deuda no encontrada");
    }
  }

  async confirm(data: DebtConfirmData): Promise<Debt> {
    const debt = await this.db.orm.public.Debt.where({
      id: data.id,
    }).update(debtConfirmToDbMapper(data));
    if (!debt) {
      throw error.notFound("Deuda no encontrada");
    }
    return debtToDomainMapper(debt);
  }
}
