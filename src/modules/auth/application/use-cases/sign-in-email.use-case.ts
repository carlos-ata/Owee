import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { error } from "#domain/errors/app-error.js";

import { User } from "#auth/domain/entities/user.entity.js";

import type { SignInEmailDTO } from "#auth/application/dto/sign-in-email.dto.js";

interface Deps {
  authRepository: IAuthRepository;
}

export default class SignUpEmailUseCase {
  private readonly authRepository: IAuthRepository;

  constructor(deps: Deps) {
    this.authRepository = deps.authRepository;
  }

  async execute(
    data: SignInEmailDTO,
  ): Promise<{ user: User; cookies: string[] }> {
    const user = User.signIn({
      email: data.email,
      password: data.password,
    });
    const resSignIn = await this.authRepository.signInEmail(user);

    if (!resSignIn.user.isActive()) {
      await this.authRepository.revokeSession(resSignIn.token);
      throw error.forbidden("Usuario inactivo");
    }
    return resSignIn;
  }
}
