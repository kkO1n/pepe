import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { REFRESH_EXPIRES_AT } from 'src/common/constants';
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

  async signIn(login: string, pass: string) {
    await this.userSessionRepository.deleteExpired();
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

  async refresh(refreshToken: string) {
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

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.userSessionRepository.deleteExpired();
    await this.userSessionRepository.deleteByToken(refreshToken);
  }

  private async issueTokens(user: { id: number; login: string }) {
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      login: user.login,
    });
    const refresh_token = crypto.randomUUID();

    await this.userSessionRepository.upsertForUser(
      user.id,
      refresh_token,
      new Date(Date.now() + REFRESH_EXPIRES_AT),
    );

    return {
      access_token,
      refresh_token,
    };
  }
}
