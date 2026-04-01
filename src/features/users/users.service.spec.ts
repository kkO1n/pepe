import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../common/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repositoryMock = {
    findMany: jest.fn(),
    findById: jest.fn(),
    findByLogin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDeleteById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: IUserRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('listUsers delegates to repository with the same params', async () => {
    const params: GetUsersQueryDto = { page: 2, limit: 5, login: 'jo' };
    repositoryMock.findMany.mockResolvedValue([[], 0]);

    const result = await service.listUsers(params);

    expect(repositoryMock.findMany).toHaveBeenCalledWith(params);
    expect(result).toEqual({ data: [], total: 0 });
  });

  it('getPublicUserByLogin delegates to repository', async () => {
    repositoryMock.findByLogin.mockResolvedValue(null);

    await service.getPublicUserByLogin('john');

    expect(repositoryMock.findByLogin).toHaveBeenCalledWith('john');
  });

  it('createUser delegates to repository', async () => {
    const dto: CreateUserDto = {
      login: 'john',
      email: 'john@example.com',
      password: 'secret',
      age: 21,
      description: 'desc',
    };
    repositoryMock.create.mockResolvedValue({
      id: 1,
      ...dto,
      deletedAt: null,
    });

    await service.createUser(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith(dto);
  });

  it('updateUser delegates to repository', async () => {
    const dto: UpdateUserDto = { description: 'updated' };
    repositoryMock.update.mockResolvedValue({
      id: 2,
      login: 'john',
      email: 'john@example.com',
      password: 'hashed',
      age: 21,
      description: dto.description,
      deletedAt: null,
    });

    await service.updateUser(2, dto);

    expect(repositoryMock.update).toHaveBeenCalledWith(2, dto);
  });

  it('deleteUser delegates to repository', async () => {
    repositoryMock.softDeleteById.mockResolvedValue(undefined);

    await service.deleteUser(3);

    expect(repositoryMock.softDeleteById).toHaveBeenCalledWith(3);
  });
});
