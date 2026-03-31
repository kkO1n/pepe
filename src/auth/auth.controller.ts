import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() signInDto: { login: string; password: string }) {
    return this.authService.signIn(signInDto.login, signInDto.password);
  }

  @Post('register')
  signUp(@Body() signUpDto: CreateUserDto, @Res() res: Response) {
    const payload = this.authService.signUp(signUpDto);

    res.cookie('Set-Cookie', crypto.randomUUID());

    return payload;
  }
}
