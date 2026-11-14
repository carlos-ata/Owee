import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { error } from "#domain/errors/app-error.js";

interface Deps {
  authRepository: IAuthRepository;
}

export default class SignOutUseCase {
  private readonly authRepository: IAuthRepository;

  constructor(deps: Deps) {
    this.authRepository = deps.authRepository;
  }

  async execute(cookie: string | undefined): Promise<string[]> {
    if (!cookie) throw error.unauthorized("No hay sesión activa");
    return this.authRepository.signOut(cookie);
  }
}
