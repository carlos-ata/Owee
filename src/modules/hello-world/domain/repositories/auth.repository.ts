export interface IAuthRepository {
  updateActiveSession(id: string): Promise<void>;
  createSession(): Promise<void>;
  updateTokenSession(id: string, refreshToken: string): Promise<void>;
  findActiveSessionByUid(uid: string): Promise<void>;
}
