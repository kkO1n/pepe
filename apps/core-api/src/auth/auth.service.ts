import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import * as crypto from 'crypto';
import { REFRESH_EXPIRES_AT } from '@core-api/common/constants';
import { IUserSessionRepository } from '@core-api/common/interfaces/user-session-repository.interface';
import { CreateUserDto } from '@core-api/features/users/dto/create-user-dto';
import { UsersService } from '@core-api/features/users/users.service';

export type JwtPayload = {
  sub: number;
  login: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userSessionRepository: IUserSessionRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(login: string, pass: string) {
    const user = await this.usersService.getAuthUserByLogin(login);

    if (!user || !(await compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    return this.issueTokens(user);
  }

  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.getAuthUserByLogin(
      createUserDto.login,
    );

    if (existingUser) {
      throw new ConflictException();
    }

    const saltRounds = +this.configService.get('SALT_ROUNDS');

    await this.usersService.createUser({
      ...createUserDto,
      password: await hash(createUserDto.password, saltRounds),
    });

    return await this.signIn(createUserDto.login, createUserDto.password);
  }

  async refresh(refresh_token: string) {
    const hashedRefreshToken = this.hashRefreshToken(refresh_token);

    const session =
      await this.userSessionRepository.findUserByRefreshTokenHash(
        hashedRefreshToken,
      );

    if (!session) throw new UnauthorizedException();

    const user = await this.usersService.getUserById(session.userId);

    if (!user) {
      await this.userSessionRepository.revokeByRefreshTokenHash(
        hashedRefreshToken,
      );
      throw new UnauthorizedException();
    }

    return this.issueTokens(user);
  }

  async logout(refresh_token: string): Promise<void> {
    const hashedRefreshToken = this.hashRefreshToken(refresh_token);

    await this.userSessionRepository.revokeByRefreshTokenHash(
      hashedRefreshToken,
    );
  }

  private async issueTokens(user: { id: number; login: string }) {
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      login: user.login,
    });

    const refresh_token = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = this.hashRefreshToken(refresh_token);

    await this.userSessionRepository.create(
      user.id,
      hashedRefreshToken,
      new Date(Date.now() + REFRESH_EXPIRES_AT),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  private hashRefreshToken(token: string) {
    const secret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_HASH_SECRET',
    );

    return crypto.createHmac('sha256', secret).update(token).digest('hex');
  }
}
