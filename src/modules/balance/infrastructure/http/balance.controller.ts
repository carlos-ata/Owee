import type BalanceGetUseCase from "#balance/application/use-cases/balance-get.use-case.js";
import type { Request, Response, NextFunction } from "express";

import { balanceGetToResponseMapper } from "#balance/infrastructure/http/dto/balance-get-response.dto.js";

interface Deps {
  balanceGetUseCase: BalanceGetUseCase;
}

export default class BalanceController {
  private readonly balanceGetUseCase: BalanceGetUseCase;

  constructor(deps: Deps) {
    this.balanceGetUseCase = deps.balanceGetUseCase;
  }

  getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const balance = await this.balanceGetUseCase.execute(res.locals.user);
      res.success(balanceGetToResponseMapper(balance));
    } catch (error) {
      next(error);
    }
  };
}
