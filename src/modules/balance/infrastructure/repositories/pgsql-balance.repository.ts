import type { db as DbInstance } from "#prisma/db.js";
import type { IBalanceRepository } from "#balance/domain/repositories/balance.repository.js";

import { error } from "#domain/errors/app-error.js";

import type { Balance } from "#balance/domain/entities/balance.entity.js";

import { balanceToDomainMapper } from "#balance/infrastructure/repositories/mappers/balance-to-domain.mapper.js";

interface Deps {
  db: typeof DbInstance;
}

export default class PgSqlBalanceRepository implements IBalanceRepository {
  private readonly db: typeof DbInstance;

  constructor(deps: Deps) {
    this.db = deps.db;
  }

  async getBalance(userId: string): Promise<Balance> {
    const query = this.db.raw.sql`
      SELECT
          COALESCE(SUM(
              CASE
                  WHEN d.creditor_id = ${userId}
                  THEN d.amount - COALESCE(pd.total_paid, 0)
                  ELSE 0
              END
          ), 0) AS receivable_amount,
      
          COUNT(DISTINCT d.debtor_id) FILTER (
              WHERE d.creditor_id = ${userId}
                AND d.debtor_id IS NOT NULL
          ) AS receivable_count,
      
          COALESCE(SUM(
              CASE
                  WHEN d.debtor_id = ${userId}
                  THEN d.amount - COALESCE(pd.total_paid, 0)
                  ELSE 0
              END
          ), 0) AS payable_amount,
      
          COUNT(DISTINCT d.creditor_id) FILTER (
              WHERE d.debtor_id = ${userId}
                AND d.creditor_id IS NOT NULL
          ) AS payable_count
      
      FROM public.debt d
      LEFT JOIN (
          SELECT
              debt_id,
              SUM(amount) AS total_paid
          FROM public.payment_detail
          GROUP BY debt_id
      ) pd ON pd.debt_id = d.id
      
      WHERE
          (d.creditor_id = ${userId} OR d.debtor_id = ${userId})
          AND d.is_settled = false;
    `
      .returnsRow({
        receivable_amount: "pg/numeric@1",
        payable_amount: "pg/numeric@1",
        receivable_count: "pg/int@1",
        payable_count: "pg/int@1",
      })
      .build();

    const [rows] = await this.db.runtime().query(query);

    return balanceToDomainMapper(rows);
  }
}
