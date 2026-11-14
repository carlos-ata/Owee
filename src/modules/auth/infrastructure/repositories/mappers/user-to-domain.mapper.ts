import type { PrismaUserRow } from "#auth/infrastructure/repositories/types/prisma-user.types.js";
import { User } from "#auth/domain/entities/user.entity.js";

export function userToDomainMapper(result: PrismaUserRow): User {
  return User.reconstitute({
    id: result.id,
    email: result.email,
    name: result.name,
    lastNames: result.lastNames,
    password: "",
    image: result.image,
    status: result.status,
    emailVerified: result.emailVerified,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}
