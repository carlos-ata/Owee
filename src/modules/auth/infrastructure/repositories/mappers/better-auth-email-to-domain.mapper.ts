import type { BetterAuthSignUpResult } from "#auth/infrastructure/repositories/types/better-auth.types.js";
import { User } from "#auth/domain/entities/user.entity.js";

export function betterAuthEmailToDomainMapper(
  result: BetterAuthSignUpResult,
): User {
  const { user } = result;
  return User.reconstitute({
    id: user.id,
    email: user.email,
    name: user.name,
    lastNames: user.lastNames,
    password: "",
    image: user.image,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
}
