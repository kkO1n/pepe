export abstract class IUserSessionRepository {
  abstract create(
    userId: number,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void>;

  abstract findUserByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<SessionLookupResult | null>;

  abstract revokeByRefreshTokenHash(refreshTokenHash: string): Promise<void>;
}

export type SessionLookupResult = {
  userId: number;
};
