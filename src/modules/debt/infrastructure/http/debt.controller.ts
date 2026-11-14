import type DebtCreateUseCase from "#debt/application/use-cases/debt-create.use-case.js";
import type DebtCancelUseCase from "#debt/application/use-cases/debt-cancel.use-case.js";
import type { Request, Response, NextFunction } from "express";

import { debtGenericToResponseMapper } from "#debt/infrastructure/http/dto/debt-generic-response.dto.js";

import { debtCreateToDomainMapper } from "#modules/debt/infrastructure/http/mappers/debt-create-to-domain.mapper.js";
import { debtIdentityToDomainMapper } from "#modules/debt/infrastructure/http/mappers/debt-identity-to-domain.mapper.js";

import type DebtConfirmUseCase from "#debt/application/use-cases/debt-confirm.use-case.js";

import { debtIdentitySchema } from "#debt/infrastructure/http/schemas/debt-identity.schema.js";

interface Deps {
  debtCreateUseCase: DebtCreateUseCase;
  debtCancelUseCase: DebtCancelUseCase;
  debtConfirmUseCase: DebtConfirmUseCase;
}

export default class ExpressDebtController {
  private readonly debtCreateUseCase: DebtCreateUseCase;
  private readonly debtCancelUseCase: DebtCancelUseCase;
  private readonly debtConfirmUseCase: DebtConfirmUseCase;

  constructor(deps: Deps) {
    this.debtCreateUseCase = deps.debtCreateUseCase;
    this.debtCancelUseCase = deps.debtCancelUseCase;
    this.debtConfirmUseCase = deps.debtConfirmUseCase;
  }

  createDebt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const debt = await this.debtCreateUseCase.execute(
        res.locals.user,
        debtCreateToDomainMapper(req.body),
      );
      res.success(debtGenericToResponseMapper(debt), 201);
    } catch (error) {
      next(error);
    }
  };

  cancelDebt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = debtIdentitySchema.parse(req.params);

      await this.debtCancelUseCase.execute(
        res.locals.user,
        debtIdentityToDomainMapper(params),
      );
      res.success(null, 204);
    } catch (error) {
      next(error);
    }
  };

  confirmDebt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = debtIdentitySchema.parse(req.params);
      const debt = await this.debtConfirmUseCase.execute(
        res.locals.user,
        debtIdentityToDomainMapper(params),
      );
      res.success(debtGenericToResponseMapper(debt), 200);
    } catch (error) {
      next(error);
    }
  };
}
