import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import * as crypto from 'crypto';
import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import type { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import type { User } from 'src/features/users/entity/user.entity';
import { UsersService } from 'src/features/users/users.service';
import { AuthService } from './auth.service';

const hashToken = (token: string) =>
  crypto
    .createHmac('sha256', 'test-refresh-secret')
    .update(token)
    .digest('hex');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const buildUser = (): User => ({
    id: 1,
    login: 'john',
    email: 'john@example.com',
    password: hashSync('secret', 10),
    age: 22,
    description: 'desc',
    deletedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getAuthUserByLogin: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: IUserSessionRepository,
          useValue: {
            findValidByToken: jest.fn(),
            upsertForUser: jest.fn(),
            deleteByToken: jest.fn(),
            deleteExpired: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    userSessionRepository = module.get(IUserSessionRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    userSessionRepository.deleteExpired.mockResolvedValue(undefined);
    userSessionRepository.upsertForUser.mockResolvedValue(undefined);
    userSessionRepository.deleteByToken.mockResolvedValue(undefined);
    jwtService.signAsync.mockResolvedValue('access-token');

    const configMap: Record<string, string> = {
      SALT_ROUNDS: '10',
      REFRESH_TOKEN_HASH_SECRET: 'test-refresh-secret',
    };

    configService.get.mockImplementation((key: string) => configMap[key]);
    configService.getOrThrow.mockImplementation((key: string) => {
      const value = configMap[key];
      if (value === undefined) throw new Error(`Unexpected config key: ${key}`);
      return value;
    });
  });

  it('signIn returns access and refresh tokens for valid credentials', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue(buildUser());

    const result = await service.signIn('john', 'secret');

    expect(result.access_token).toBe('access-token');
    expect(typeof result.refresh_token).toBe('string');
    expect(result.refresh_token.length).toBeGreaterThan(0);
    const [userId, tokenHash, expiresAt] =
      userSessionRepository.upsertForUser.mock.calls[0] ?? [];

    expect(userId).toBe(1);
    expect(tokenHash).toBe(hashToken(result.refresh_token));
    expect(expiresAt).toBeInstanceOf(Date);
  });

  it('signIn throws UnauthorizedException for invalid credentials', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue(null);

    await expect(service.signIn('john', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('signUp returns access and refresh tokens for a new user', async () => {
    const dto: CreateUserDto = {
      login: 'new-user',
      email: 'new-user@example.com',
      password: 'secret',
      age: 20,
      description: 'desc',
    };

    usersService.getAuthUserByLogin
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildUser());
    usersService.createUser.mockResolvedValue(buildUser());

    const result = await service.signUp(dto);

    expect(result.access_token).toBe('access-token');
    expect(typeof result.refresh_token).toBe('string');
  });

  it('signUp throws ConflictException when login is already taken', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue(buildUser());

    await expect(
      service.signUp({
        login: 'john',
        email: 'john2@example.com',
        password: 'secret',
        age: 22,
        description: 'desc',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refresh returns new tokens for a valid refresh token', async () => {
    const refreshToken = 'old-refresh-token';

    usersService.getUserById.mockResolvedValue(buildUser());
    userSessionRepository.findValidByToken.mockResolvedValue({
      id: 1,
      userId: 1,
      refreshToken: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: buildUser(),
    });

    const result = await service.refresh(refreshToken);

    expect(result.access_token).toBe('access-token');
    expect(typeof result.refresh_token).toBe('string');
    expect(result.refresh_token.length).toBeGreaterThan(0);
    const [lookupTokenHash, lookupNow] =
      userSessionRepository.findValidByToken.mock.calls[0] ?? [];

    expect(lookupTokenHash).toBe(hashToken(refreshToken));
    expect(lookupNow).toBeInstanceOf(Date);
  });

  it('refresh throws UnauthorizedException for unknown refresh token', async () => {
    userSessionRepository.findValidByToken.mockResolvedValue(null);

    await expect(service.refresh('missing-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logout does not throw for valid refresh token', async () => {
    const refreshToken = 'refresh-token';

    await expect(service.logout(refreshToken)).resolves.toBeUndefined();
    const [deletedTokenHash] =
      userSessionRepository.deleteByToken.mock.calls[0] ?? [];

    expect(deletedTokenHash).toBe(hashToken(refreshToken));
  });
});
