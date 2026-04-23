import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { REFRESH_COOKIE_CLEAR_OPTIONS } from '../constants';

export const CurrentRefreshToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const token: unknown = req.cookies?.['refresh_token'];

    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException();
    }

    return token;
  },
);

export const ClearedRefreshToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const token: unknown = req.cookies?.['refresh_token'];

    if (typeof token !== 'string' || token.length === 0) {
      return null;
    }

    res.clearCookie('refresh_token', REFRESH_COOKIE_CLEAR_OPTIONS);

    return token;
  },
);
