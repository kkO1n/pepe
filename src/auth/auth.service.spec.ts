import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { User } from 'src/features/users/entity/user.entity';
import { UsersService } from 'src/features/users/users.service';
import { AuthService } from './auth.service';

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
    configService.get.mockReturnValue('10');
  });

  it('signIn returns access and refresh tokens for valid credentials', async () => {
    usersService.getAuthUserByLogin.mockResolvedValue(buildUser());

    const result = await service.signIn('john', 'secret');

    expect(result.access_token).toBe('access-token');
    expect(typeof result.refresh_token).toBe('string');
    expect(result.refresh_token.length).toBeGreaterThan(0);
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
    usersService.getUserById.mockResolvedValue(buildUser());
    userSessionRepository.findValidByToken.mockResolvedValue({
      id: 1,
      userId: 1,
      refreshToken: 'old-refresh-token',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: buildUser(),
    });

    const result = await service.refresh('old-refresh-token');

    expect(result.access_token).toBe('access-token');
    expect(typeof result.refresh_token).toBe('string');
    expect(result.refresh_token.length).toBeGreaterThan(0);
  });

  it('refresh throws UnauthorizedException for unknown refresh token', async () => {
    userSessionRepository.findValidByToken.mockResolvedValue(null);

    await expect(service.refresh('missing-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logout does not throw for valid refresh token', async () => {
    await expect(service.logout('refresh-token')).resolves.toBeUndefined();
  });
});
