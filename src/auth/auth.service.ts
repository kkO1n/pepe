import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, compareSync } from 'bcryptjs';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { UsersService } from 'src/features/users/users.service';

export type JwtPayload = {
  sub: number;
  login: string;
};

const sessions: Record<string, number> = {};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(
    login: string,
    pass: string,
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) throw new UnprocessableEntityException();

    if (!compareSync(pass, user.password)) {
      throw new UnauthorizedException();
    }

    return this.issueTokens(user, refreshToken);
  }

  async signUp(
    createUserDto: CreateUserDto,
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    const existingUser = await this.usersService.findOneByLogin(
      createUserDto.login,
    );

    if (existingUser) {
      throw new ConflictException();
    }
    const saltRounds: string | undefined =
      this.configService.get('SALT_ROUNDS');

    if (!saltRounds) throw new UnauthorizedException();

    await this.usersService.createOne({
      ...createUserDto,
      password: await hash(createUserDto.password, +saltRounds),
    });

    const payload = await this.signIn(
      createUserDto.login,
      createUserDto.password,
      refreshToken,
    );

    return payload;
  }

  async refresh(refreshToken: string, newRefreshToken: string) {
    const userId = sessions[refreshToken];

    if (userId) {
      const user = await this.usersService.findOneById(userId);

      if (!user) throw new UnauthorizedException();

      delete sessions[refreshToken];
      return this.issueTokens(user, newRefreshToken);
    }

    throw new UnauthorizedException();
  }

  private async issueTokens(
    user: { id: number; login: string },
    refreshToken: string,
  ) {
    sessions[refreshToken] = user.id;
    const payload: JwtPayload = { sub: user.id, login: user.login };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
