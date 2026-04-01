import {
  ConflictException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compareSync, hashSync } from 'bcryptjs';
import { CreateUserDto } from '../features/users/dto/create-user-dto';
import { User } from '../features/users/entity/user.entity';
import { UsersService } from '../features/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByLogin: jest.fn(),
            findOneById: jest.fn(),
            createOne: jest.fn(),
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
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    configService.get.mockReturnValue('10');
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
    usersService.findOneByLogin.mockResolvedValue(user);

    const result = await service.signIn('john', 'secret', 'rt-1');

    expect(result).toEqual({ access_token: 'access-token' });
    expect(jwtService.signAsync.mock.calls[0]?.[0]).toEqual({
      sub: 1,
      login: 'john',
    });
  });

  it('signIn should throw when user does not exist', async () => {
    usersService.findOneByLogin.mockResolvedValue(null);

    await expect(
      service.signIn('john', 'secret', 'rt-1'),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('signIn should throw on invalid password', async () => {
    usersService.findOneByLogin.mockResolvedValue({
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
    usersService.findOneByLogin.mockResolvedValue({
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

    usersService.findOneByLogin
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(storedUser);
    usersService.createOne.mockImplementation((payload: CreateUserDto) => {
      expect(compareSync(dto.password, payload.password)).toBe(true);
      return Promise.resolve(storedUser);
    });

    const result = await service.signUp(dto, 'rt-signup');

    expect(result).toEqual({ access_token: 'access-token' });
    expect(usersService.createOne.mock.calls).toHaveLength(1);
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

    usersService.findOneByLogin.mockResolvedValue(user);
    usersService.findOneById.mockResolvedValue(user);

    await service.signIn('refresh-user', 'secret', 'old-rt');
    const refreshed = await service.refresh('old-rt', 'new-rt');

    expect(refreshed).toEqual({ access_token: 'access-token' });
  });

  it('refresh should throw for unknown refresh token', async () => {
    await expect(
      service.refresh('missing-rt', 'new-rt'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
