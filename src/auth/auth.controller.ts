import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { LoginUserDto } from 'src/features/users/dto/login-user-dto';
import {
  ClearedRefreshToken,
  CurrentRefreshToken,
} from 'src/common/decorators/refresh-token';
import { REFRESH_COOKIE_OPTIONS } from 'src/common/constants';
import { type Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(
    @Body() signInDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.signIn(
      signInDto.login,
      signInDto.password,
    );

    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);

    return {
      access_token,
    };
  }

  @Post('register')
  async signUp(
    @Body() signUpDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.signUp(signUpDto);

    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);

    return {
      access_token,
    };
  }

  @Post('refresh')
  async refresh(
    @CurrentRefreshToken() currentRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.refresh(currentRefreshToken);

    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);

    return { access_token };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@ClearedRefreshToken() clearedRefreshToken: string | null) {
    if (!clearedRefreshToken) return;

    await this.authService.logout(clearedRefreshToken);
  }
}
