import type {
  User,
  UserCreateProps,
  UserSignInProps,
} from "#auth/domain/entities/user.entity.js";

export interface IAuthRepository {
  signUpEmail(data: UserCreateProps): Promise<User>;
  signInEmail(
    data: UserSignInProps,
  ): Promise<{ user: User; cookies: string[]; token: string }>;
  revokeSession(token: string): Promise<void>;
  signOut(cookie: string): Promise<string[]>;
  getSession(cookie: string | undefined): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
