import type { NewUserData } from "#auth/domain/entities/user.entity.js";

export function signUpEmailToDbMapper(data: NewUserData) {
  return {
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      lastNames: data.lastNames,
      status: data.status,
    },
  };
}
