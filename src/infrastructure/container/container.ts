import { createContainer, InjectionMode, asValue, asClass } from "awilix";
import { auth } from "#infrastructure/auth/auth.js";
import { db } from "#prisma/db.js";

import type { IAuthRepository } from "#modules/auth/domain/repositories/auth.repository.js";
import type { IDebtRepository } from "#modules/debt/domain/repositories/debt.repository.js";
import type { IBalanceRepository } from "#balance/domain/repositories/balance.repository.js";

import PgSqlAuthRepository from "#auth/infrastructure/repositories/pgsql-auth.repository.js";
import PgSqlDebtRepository from "#debt/infrastructure/repositories/pgsql-debt.repository.js";
import PgSqlBalanceRepository from "#balance/infrastructure/repositories/pgsql-balance.repository.js";

import SignUpEmailUseCase from "#modules/auth/application/use-cases/sign-up-email.use-case.js";
import SignInEmailUseCase from "#modules/auth/application/use-cases/sign-in-email.use-case.js";
import SignOutUseCase from "#modules/auth/application/use-cases/sign-out-email.use-case.js";
import GetSessionUseCase from "#modules/auth/application/use-cases/get-session.use-case.js";
import DebtCreateUseCase from "#modules/debt/application/use-cases/debt-create.use-case.js";
import DebtCancelUseCase from "#modules/debt/application/use-cases/debt-cancel.use-case.js";
import DebtConfirmUseCase from "#modules/debt/application/use-cases/debt-confirm.use-case.js";
import BalanceGetUseCase from "#modules/balance/application/use-cases/balance-get.use-case.js";

import ExpressAuthController from "#modules/auth/infrastructure/http/auth.controller.js";
import ExpressDebtController from "#modules/debt/infrastructure/http/debt.controller.js";
import ExpressBalanceController from "#balance/infrastructure/http/balance.controller.js";

interface Cradle {
  db: typeof db;
  auth: typeof auth;
  authRepository: IAuthRepository;
  debtRepository: IDebtRepository;
  balanceRepository: IBalanceRepository;

  signUpEmailUseCase: SignUpEmailUseCase;
  signInEmailUseCase: SignInEmailUseCase;
  signOutUseCase: SignOutUseCase;
  getSessionUseCase: GetSessionUseCase;
  debtCreateUseCase: DebtCreateUseCase;
  debtCancelUseCase: DebtCancelUseCase;
  debtConfirmUseCase: DebtConfirmUseCase;
  balanceGetUseCase: BalanceGetUseCase;

  authController: ExpressAuthController;
  debtController: ExpressDebtController;
  balanceController: ExpressBalanceController;
}

export const container = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

container.register({
  db: asValue(db),
  auth: asValue(auth),

  authRepository: asClass(PgSqlAuthRepository).singleton(),
  debtRepository: asClass(PgSqlDebtRepository).singleton(),
  balanceRepository: asClass(PgSqlBalanceRepository).singleton(),

  signUpEmailUseCase: asClass(SignUpEmailUseCase).singleton(),
  signInEmailUseCase: asClass(SignInEmailUseCase).singleton(),
  signOutUseCase: asClass(SignOutUseCase).singleton(),
  getSessionUseCase: asClass(GetSessionUseCase).singleton(),
  debtCreateUseCase: asClass(DebtCreateUseCase).singleton(),
  debtCancelUseCase: asClass(DebtCancelUseCase).singleton(),
  debtConfirmUseCase: asClass(DebtConfirmUseCase).singleton(),
  balanceGetUseCase: asClass(BalanceGetUseCase).singleton(),

  authController: asClass(ExpressAuthController).singleton(),
  debtController: asClass(ExpressDebtController).singleton(),
  balanceController: asClass(ExpressBalanceController).singleton(),
});
