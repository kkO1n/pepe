import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

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

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    });

    return token;
  },
);
