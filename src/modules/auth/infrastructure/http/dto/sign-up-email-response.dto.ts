import type { User } from "#auth/domain/entities/user.entity.js";

export function signUpEmailToResponseMapper(data: User) {
  return {
    user: {
      name: data.name,
      email: data.email,
      lastNames: data.lastNames,
    },
  };
}
