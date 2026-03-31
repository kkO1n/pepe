import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(login: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(login);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, login: user.login };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findOne(createUserDto.login);

    if (existingUser) {
      throw new ConflictException();
    }

    const createdUser = await this.usersService.createOne(createUserDto);

    return this.signIn(createdUser.login, createdUser.password);
  }
}
