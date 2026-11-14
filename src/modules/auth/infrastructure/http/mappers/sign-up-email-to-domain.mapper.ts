import type { SignUpEmailSchema } from "#auth/infrastructure/http/schemas/sign-up-email.schema.js";
import type { SignUpEmailDTO } from "#auth/application/dto/sign-up-email.dto.js";

export function signUpEmailToDomainMapper(
  data: SignUpEmailSchema,
): SignUpEmailDTO {
  return {
    name: data.user.name,
    email: data.user.email,
    password: data.user.password,
    lastNames: data.user.lastNames,
  };
}
