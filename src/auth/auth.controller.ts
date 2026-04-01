import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { type Response, type Request } from 'express';
import { LoginUserDto } from 'src/features/users/dto/login-user-dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(
    @Body() signInDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = crypto.randomUUID();

    const payload = await this.authService.signIn(
      signInDto.login,
      signInDto.password,
      refreshToken,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return payload;
  }

  @Post('register')
  async signUp(
    @Body() signUpDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = crypto.randomUUID();

    const payload = await this.authService.signUp(signUpDto, refreshToken);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
      const payload = await this.authService.refresh(
        refreshToken,
        newRefreshToken,
      );

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return payload;
    }

    throw new UnauthorizedException();
  }
}
