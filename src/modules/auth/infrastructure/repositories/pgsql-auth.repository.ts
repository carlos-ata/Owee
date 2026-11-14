import type { IAuthRepository } from "#auth/domain/repositories/auth.repository.js";
import type {
  User,
  NewUserData,
  UserSignInProps,
} from "#auth/domain/entities/user.entity.js";

import type { db as DbInstance } from "#prisma/db.js";
import type { auth as AuthInstance } from "#infrastructure/auth/auth.js";

import { signUpEmailToDbMapper } from "#auth/infrastructure/repositories/mappers/sign-up-email-to-db.mapper.js";
import { signInEmailToDbMapper } from "#auth/infrastructure/repositories/mappers/sign-in-email-to-db.mapper.js";

import { betterAuthEmailToDomainMapper } from "#auth/infrastructure/repositories/mappers/better-auth-email-to-domain.mapper.js";
import { userToDomainMapper } from "#auth/infrastructure/repositories/mappers/user-to-domain.mapper.js";

import { error } from "#domain/errors/app-error.js";

interface Deps {
  db: typeof DbInstance;
  auth: typeof AuthInstance;
}

export default class PgSqlAuthRepository implements IAuthRepository {
  private readonly auth: typeof AuthInstance;
  private readonly db: typeof DbInstance;

  constructor(deps: Deps) {
    this.db = deps.db;
    this.auth = deps.auth;
  }

  async signUpEmail(data: NewUserData): Promise<User> {
    const result = await this.auth.api.signUpEmail(signUpEmailToDbMapper(data));
    return betterAuthEmailToDomainMapper(result);
  }

  async signInEmail(
    data: UserSignInProps,
  ): Promise<{ user: User; cookies: string[]; token: string }> {
    const result = await this.auth.api.signInEmail({
      ...signInEmailToDbMapper(data),
      returnHeaders: true,
    });
    return {
      user: betterAuthEmailToDomainMapper({ user: result.response.user }),
      cookies: result.headers.getSetCookie(),
      token: result.response.token,
    };
  }

  async revokeSession(token: string): Promise<void> {
    await this.db.orm.public.Session.where({ token }).deleteAll();
  }

  async signOut(cookie: string): Promise<string[]> {
    const { headers } = await this.auth.api.signOut({
      headers: new Headers({ cookie }),
      returnHeaders: true,
    });
    return headers.getSetCookie();
  }

  async getSession(cookie: string): Promise<User | null> {
    const result = await this.auth.api.getSession({
      headers: new Headers({ cookie }),
    });

    if (!result) return null;

    return betterAuthEmailToDomainMapper({ user: result.user });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.orm.public.User.where({ id }).first();
    if (!user) {
      return null;
    }
    return userToDomainMapper(user);
  }
}
