import type { SignInEmailSchema } from "#auth/infrastructure/http/schemas/sign-in-email.schema.js";
import type { SignInEmailDTO } from "#auth/application/dto/sign-in-email.dto.js";

export function signInEmailToDomainMapper(
  data: SignInEmailSchema,
): SignInEmailDTO {
  return {
    email: data.user.email,
    password: data.user.password,
  };
}
