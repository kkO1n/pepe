import {
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compareSync, hashSync } from 'bcryptjs';
import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import { CreateUserDto } from '../features/users/dto/create-user-dto';
import { User } from '../features/users/entity/user.entity';
import { UsersService } from '../features/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getAuthUserByLogin: jest.fn(),
            getPublicUserByLogin: jest.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    userSessionRepository = module.get(IUserSessionRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    configService.get.mockImplementation((key: string) => {
      if (key === 'SALT_ROUNDS') return '10';
      if (key === 'REFRESH_TOKEN_TTL_DAYS') return '7';
      return undefined;
    });
    jwtService.signAsync.mockResolvedValue('access-token');
  });

  it('signIn should return access token for valid credentials', async () => {
    const user: User = {
      id: 1,
      login: 'john',
      email: 'john@example.com',
      password: hashSync('secret', 10),
      age: 22,
      description: 'desc',
      deletedAt: null,
    };
    usersService.getAuthUserByLogin.mockResolvedValue(user);

    const result = await service.signIn('john', 'secret', 'rt-1');

    expect(result).toEqual({ access_token: 'access-token' });
    const signInSessionCall = userSessionRepository.upsertForUser.mock.calls[0];
    expect(signInSessionCall?.[0]).toBe(1);
    expect(signInSessionCall?.[1]).toBe('rt-1');
    expect(signInSessionCall?.[2]).toBeInstanceOf(Date);
    expect(jwtService.signAsync.mock.calls[0]?.[0]).toEqual({
      sub: 1,
      login: 'john',
    });
  });

  it('signIn should throw when user does not exist', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue(null);

    await expect(
      service.signIn('john', 'secret', 'rt-1'),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('signIn should throw on invalid password', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue({
      id: 1,
      login: 'john',
      email: 'john@example.com',
      password: hashSync('secret', 10),
      age: 22,
      description: 'desc',
      deletedAt: null,
    });

    await expect(
      service.signIn('john', 'wrong', 'rt-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signUp should throw conflict when login is taken', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue({
      id: 1,
      login: 'john',
      email: 'john@example.com',
      password: hashSync('secret', 10),
      age: 22,
      description: 'desc',
      deletedAt: null,
    });

    await expect(
      service.signUp(
        {
          login: 'john',
          email: 'john2@example.com',
          password: 'secret',
          age: 22,
          description: 'desc',
        },
        'rt-1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('signUp should create user with hashed password and return token', async () => {
    const dto: CreateUserDto = {
      login: 'new-user',
      email: 'new-user@example.com',
      password: 'secret',
      age: 20,
      description: 'desc',
    };
    const storedUser: User = {
      id: 7,
      login: dto.login,
      email: dto.email,
      password: hashSync(dto.password, 10),
      age: dto.age,
      description: dto.description,
      deletedAt: null,
    };

    usersService.getAuthUserByLogin
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(storedUser);
    usersService.createUser.mockImplementation((payload: CreateUserDto) => {
      expect(compareSync(dto.password, payload.password)).toBe(true);
      return Promise.resolve(storedUser);
    });

    const result = await service.signUp(dto, 'rt-signup');

    expect(result).toEqual({ access_token: 'access-token' });
    expect(usersService.createUser.mock.calls).toHaveLength(1);
  });

  it('refresh should issue a new access token for an active refresh token', async () => {
    const user: User = {
      id: 12,
      login: 'refresh-user',
      email: 'refresh-user@example.com',
      password: hashSync('secret', 10),
      age: 30,
      description: 'desc',
      deletedAt: null,
    };

    userSessionRepository.findValidByToken.mockResolvedValue({
      id: 1,
      userId: user.id,
      refreshToken: 'old-rt',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user,
    });
    usersService.getUserById.mockResolvedValue(user);
    const refreshed = await service.refresh('old-rt', 'new-rt');

    expect(refreshed).toEqual({ access_token: 'access-token' });
    const refreshSessionCall =
      userSessionRepository.upsertForUser.mock.calls[0];
    expect(refreshSessionCall?.[0]).toBe(12);
    expect(refreshSessionCall?.[1]).toBe('new-rt');
    expect(refreshSessionCall?.[2]).toBeInstanceOf(Date);
  });

  it('refresh should throw for unknown refresh token', async () => {
    userSessionRepository.findValidByToken.mockResolvedValue(null);

    await expect(
      service.refresh('missing-rt', 'new-rt'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logout should invalidate session token when provided', async () => {
    await service.logout('rt-1');

    const logoutCall = userSessionRepository.deleteByToken.mock.calls[0];
    expect(logoutCall?.[0]).toBe('rt-1');
  });

  it('logout should not fail when token is missing', async () => {
    await expect(service.logout()).resolves.toBeUndefined();
    expect(userSessionRepository.deleteByToken.mock.calls).toHaveLength(0);
  });
});
