import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import { User } from "#auth/domain/entities/user.entity.js";
import type { SignUpEmailDTO } from "#auth/application/dto/sign-up-email.dto.js";

interface Deps {
  authRepository: IAuthRepository;
}

export default class SignUpEmailUseCase {
  private readonly authRepository: IAuthRepository;

  constructor(deps: Deps) {
    this.authRepository = deps.authRepository;
  }

  async execute(data: SignUpEmailDTO): Promise<User> {
    const user = User.create({
      name: data.name,
      lastNames: data.lastNames,
      email: data.email,
      password: data.password,
    });
    return this.authRepository.signUpEmail(user);
  }
}
