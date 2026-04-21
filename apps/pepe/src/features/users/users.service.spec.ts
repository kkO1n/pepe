import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DATA_SOURCE } from '@pepe/common/constants';
import { IUserRepository } from '@pepe/common/interfaces/user-repository.interface';
import type { CreateUserDto } from './dto/create-user-dto';
import type { GetUsersQueryDto } from './dto/get-users-query-dto';
import type { UpdateUserDto } from './dto/update-user-dto';
import type { User } from './entity/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<IUserRepository>;

  const buildUser = (): User => ({
    id: 1,
    login: 'john',
    email: 'john@example.com',
    password: 'hashed-password',
    age: 22,
    balance: 0,
    description: 'desc',
    deletedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATA_SOURCE,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: IUserRepository,
          useValue: {
            transfer: jest.fn(),
            findManyByActivity: jest.fn(),
            findManyByLogin: jest.fn(),
            findById: jest.fn(),
            findByLogin: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDeleteById: jest.fn(),
            lockUsers: jest.fn(),
            debit: jest.fn(),
            credit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepository = module.get(IUserRepository);
  });

  it('listUsers returns paginated public users', async () => {
    userRepository.findManyByLogin.mockResolvedValue([[buildUser()], 1]);
    const query: GetUsersQueryDto = { page: 1, limit: 10 };

    const result = await service.listUsers(query);

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 1,
      login: 'john',
      email: 'john@example.com',
      age: 22,
      description: 'desc',
    });
    expect('password' in result.data[0]).toBe(false);
  });

  it('getPublicUserByLogin returns public user dto', async () => {
    userRepository.findByLogin.mockResolvedValue(buildUser());

    const result = await service.getPublicUserByLogin('john');

    expect(result).toMatchObject({
      id: 1,
      login: 'john',
      email: 'john@example.com',
      age: 22,
      description: 'desc',
    });
    expect('password' in result).toBe(false);
  });

  it('getAuthUserByLogin returns raw auth user', async () => {
    userRepository.findByLogin.mockResolvedValue(buildUser());

    const result = await service.getAuthUserByLogin('john');

    expect(result?.password).toBe('hashed-password');
  });

  it('createUser returns created user', async () => {
    const dto: CreateUserDto = {
      login: 'new-user',
      email: 'new-user@example.com',
      password: 'secret',
      age: 20,
      description: 'desc',
    };
    userRepository.create.mockResolvedValue({
      ...buildUser(),
      ...dto,
      id: 2,
    });

    const result = await service.createUser(dto);

    expect(result.id).toBe(2);
    expect(result.login).toBe(dto.login);
  });

  it('updateUser returns public user dto', async () => {
    const dto: UpdateUserDto = { description: 'updated' };
    userRepository.update.mockResolvedValue({
      ...buildUser(),
      description: 'updated',
    });

    const result = await service.updateUser(1, dto);

    expect(result).toMatchObject({
      id: 1,
      login: 'john',
      email: 'john@example.com',
      age: 22,
      description: 'updated',
    });
    expect('password' in result).toBe(false);
  });

  it('deleteUser resolves without error', async () => {
    userRepository.softDeleteById.mockResolvedValue(undefined);

    await expect(service.deleteUser(1)).resolves.toBeUndefined();
  });
});
