import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { RequestWithUser } from '@pepe/auth/auth.guard';
import type { JwtPayload } from '@pepe/auth/auth.service';

export const CurrentUser = createParamDecorator(
  (key: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return key ? user?.[key] : user;
  },
);
