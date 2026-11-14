import type { Request, Response, NextFunction } from "express";

import type SignUpEmailUseCase from "#auth/application/use-cases/sign-up-email.use-case.js";
import type SignInEmailUseCase from "#modules/auth/application/use-cases/sign-in-email.use-case.js";
import type SignOutUseCase from "#auth/application/use-cases/sign-out-email.use-case.js";

import { signInEmailToDomainMapper } from "#auth/infrastructure/http/mappers/sign-in-email-to-domain.mapper.js";
import { signUpEmailToDomainMapper } from "#auth/infrastructure/http/mappers/sign-up-email-to-domain.mapper.js";

import { signUpEmailToResponseMapper } from "#auth/infrastructure/http/dto/sign-up-email-response.dto.js";
import { signInEmailToResponseMapper } from "#auth/infrastructure/http/dto/sign-in-email-response.dto.js";

import { error } from "#domain/errors/app-error.js";

interface Deps {
  signUpEmailUseCase: SignUpEmailUseCase;
  signInEmailUseCase: SignInEmailUseCase;
  signOutUseCase: SignOutUseCase;
}

export default class ExpressAuthController {
  private readonly signUpEmailUseCase: SignUpEmailUseCase;
  private readonly signInEmailUseCase: SignInEmailUseCase;
  private readonly signOutUseCase: SignOutUseCase;

  constructor(deps: Deps) {
    this.signUpEmailUseCase = deps.signUpEmailUseCase;
    this.signInEmailUseCase = deps.signInEmailUseCase;
    this.signOutUseCase = deps.signOutUseCase;
  }

  signUpEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.signUpEmailUseCase.execute(
        signUpEmailToDomainMapper(req.body),
      );
      res.success(signUpEmailToResponseMapper(result), 201);
    } catch (error) {
      next(error);
    }
  };

  signInEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.signInEmailUseCase.execute(
        signInEmailToDomainMapper(req.body),
      );
      res.setHeader("set-cookie", result.cookies);
      res.success(signInEmailToResponseMapper(result.user), 200);
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookies = await this.signOutUseCase.execute(req.headers.cookie);
      res.setHeader("set-cookie", cookies);
      res.success({ message: "Sesión cerrada exitosamente" });
    } catch (error) {
      next(error);
    }
  };
}
