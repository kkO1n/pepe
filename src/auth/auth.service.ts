import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, compareSync } from 'bcryptjs';
import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { UsersService } from 'src/features/users/users.service';

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

  getRefreshTokenMaxAgeMs(): number {
    return this.getRefreshTokenTtlDays() * 24 * 60 * 60 * 1000;
  }

  async signIn(
    login: string,
    pass: string,
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    await this.userSessionRepository.deleteExpired(new Date());

    const user = await this.usersService.getAuthUserByLogin(login);

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
    const existingUser = await this.usersService.getAuthUserByLogin(
      createUserDto.login,
    );

    if (existingUser) {
      throw new ConflictException();
    }
    const saltRounds: string | undefined =
      this.configService.get('SALT_ROUNDS');

    if (!saltRounds) throw new UnauthorizedException();

    await this.usersService.createUser({
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
    const now = new Date();
    await this.userSessionRepository.deleteExpired(now);

    const session = await this.userSessionRepository.findValidByToken(
      refreshToken,
      now,
    );

    if (!session) throw new UnauthorizedException();

    const user = await this.usersService.getUserById(session.userId);

    if (!user) {
      await this.userSessionRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException();
    }

    return this.issueTokens(user, newRefreshToken);
  }

  async logout(refreshToken?: string): Promise<void> {
    await this.userSessionRepository.deleteExpired(new Date());

    if (!refreshToken) return;

    await this.userSessionRepository.deleteByToken(refreshToken);
  }

  private async issueTokens(
    user: { id: number; login: string },
    refreshToken: string,
  ) {
    const expiresAt = new Date(Date.now() + this.getRefreshTokenMaxAgeMs());
    await this.userSessionRepository.upsertForUser(
      user.id,
      refreshToken,
      expiresAt,
    );

    const payload: JwtPayload = { sub: user.id, login: user.login };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private getRefreshTokenTtlDays(): number {
    const configuredTtl = this.configService.get<string>(
      'REFRESH_TOKEN_TTL_DAYS',
    );
    const ttlDays = Number(configuredTtl ?? '7');

    if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
      throw new InternalServerErrorException();
    }

    return ttlDays;
  }
}
