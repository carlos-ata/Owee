import type { UserSignInProps } from "#auth/domain/entities/user.entity.js";

export function signInEmailToDbMapper(data: UserSignInProps) {
  return {
    body: {
      email: data.email,
      password: data.password,
    },
  };
}
