import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { type Response, type Request, type CookieOptions } from 'express';
import { LoginUserDto } from 'src/features/users/dto/login-user-dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getRefreshCookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
      maxAge,
    };
  }

  private getClearRefreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    };
  }

  @Post('login')
  async signIn(
    @Body() signInDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = crypto.randomUUID();
    const refreshMaxAge = this.authService.getRefreshTokenMaxAgeMs();

    const payload = await this.authService.signIn(
      signInDto.login,
      signInDto.password,
      refreshToken,
    );

    res.cookie(
      'refresh_token',
      refreshToken,
      this.getRefreshCookieOptions(refreshMaxAge),
    );

    return payload;
  }

  @Post('register')
  async signUp(
    @Body() signUpDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = crypto.randomUUID();
    const refreshMaxAge = this.authService.getRefreshTokenMaxAgeMs();

    const payload = await this.authService.signUp(signUpDto, refreshToken);

    res.cookie(
      'refresh_token',
      refreshToken,
      this.getRefreshCookieOptions(refreshMaxAge),
    );

    return payload;
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: unknown = request.cookies['refresh_token'];

    if (typeof refreshToken === 'string') {
      const newRefreshToken = crypto.randomUUID();
      const refreshMaxAge = this.authService.getRefreshTokenMaxAgeMs();
      const payload = await this.authService.refresh(
        refreshToken,
        newRefreshToken,
      );

      res.cookie(
        'refresh_token',
        newRefreshToken,
        this.getRefreshCookieOptions(refreshMaxAge),
      );

      return payload;
    }

    throw new UnauthorizedException();
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken: unknown = request.cookies['refresh_token'];

    await this.authService.logout(
      typeof refreshToken === 'string' ? refreshToken : undefined,
    );

    res.clearCookie('refresh_token', this.getClearRefreshCookieOptions());
  }
}
