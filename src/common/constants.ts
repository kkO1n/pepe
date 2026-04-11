import type { CookieOptions } from 'express';

export const DATA_SOURCE = 'DATA_SOURCE';
export const REFRESH_EXPIRES_AT = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/auth',
  maxAge: REFRESH_EXPIRES_AT,
};
export const MAX_AVATARS_COUNT = 5;
