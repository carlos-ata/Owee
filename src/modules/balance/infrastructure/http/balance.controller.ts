import type BalanceGetUseCase from "#balance/application/use-cases/balance-get.use-case.js";
import type CounterpartyBalanceGetUseCase from "#balance/application/use-cases/counterparty-balance-get.use-case.js";
import type { Request, Response, NextFunction } from "express";

import { balanceGetToResponseDto } from "#balance/infrastructure/http/dto/balance-get-response.dto.js";
import { counterpartyBalanceGetToResponseDto } from "#balance/infrastructure/http/dto/counterparty-balance-get-response.dto.js";

interface Deps {
  balanceGetUseCase: BalanceGetUseCase;
  counterpartyBalanceGetUseCase: CounterpartyBalanceGetUseCase;
}

export default class BalanceController {
  private readonly balanceGetUseCase: BalanceGetUseCase;
  private readonly counterpartyBalanceGetUseCase: CounterpartyBalanceGetUseCase;

  constructor(deps: Deps) {
    this.balanceGetUseCase = deps.balanceGetUseCase;
    this.counterpartyBalanceGetUseCase = deps.counterpartyBalanceGetUseCase;
  }

  getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const balance = await this.balanceGetUseCase.execute(res.locals.user);
      res.success(balanceGetToResponseDto(balance));
    } catch (error) {
      next(error);
    }
  };

  getBalanceByPerson = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const counterpartyBalance =
        await this.counterpartyBalanceGetUseCase.execute(res.locals.user);
      res.success(counterpartyBalanceGetToResponseDto(counterpartyBalance));
    } catch (error) {
      next(error);
    }
  };
}
