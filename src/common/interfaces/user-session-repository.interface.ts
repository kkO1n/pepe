import type { UserSessions } from 'src/auth/entity/user-session.entity';

export abstract class IUserSessionRepository {
  abstract findValidByToken(
    refreshToken: string,
    now?: Date,
  ): Promise<UserSessions | null>;

  abstract upsertForUser(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void>;

  abstract deleteByToken(refreshToken: string): Promise<void>;

  abstract deleteExpired(now?: Date): Promise<void>;
}
