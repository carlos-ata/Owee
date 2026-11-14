import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { error } from "#domain/errors/app-error.js";

import type { User } from "#auth/domain/entities/user.entity.js";

interface Deps {
  authRepository: IAuthRepository;
}

export default class GetSessionUseCase {
  private readonly authRepository: IAuthRepository;

  constructor(deps: Deps) {
    this.authRepository = deps.authRepository;
  }

  async execute(cookie: string | undefined): Promise<User> {
    const user = await this.authRepository.getSession(cookie);

    if (!user) throw error.unauthorized("No hay sesión activa");

    return user;
  }
}
