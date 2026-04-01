import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../../common/interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repositoryMock = {
    findUsers: jest.fn(),
    findUserById: jest.fn(),
    findUserByLogin: jest.fn(),
    createUser: jest.fn(),
    putUser: jest.fn(),
    deleteUser: jest.fn(),
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

  it('findUsers delegates to repository with the same params', async () => {
    const params: GetUsersQueryDto = { page: 2, limit: 5, login: 'jo' };
    repositoryMock.findUsers.mockResolvedValue([[], 0]);

    await service.findUsers(params);

    expect(repositoryMock.findUsers).toHaveBeenCalledWith(params);
  });

  it('findOneByLogin delegates to repository', async () => {
    repositoryMock.findUserByLogin.mockResolvedValue(null);

    await service.findOneByLogin('john');

    expect(repositoryMock.findUserByLogin).toHaveBeenCalledWith('john');
  });

  it('createOne delegates to repository', async () => {
    const dto: CreateUserDto = {
      login: 'john',
      email: 'john@example.com',
      password: 'secret',
      age: 21,
      description: 'desc',
    };
    repositoryMock.createUser.mockResolvedValue({
      id: 1,
      ...dto,
      deletedAt: null,
    });

    await service.createOne(dto);

    expect(repositoryMock.createUser).toHaveBeenCalledWith(dto);
  });

  it('putOne delegates to repository', async () => {
    const dto: UpdateUserDto = { description: 'updated' };
    repositoryMock.putUser.mockResolvedValue({
      id: 2,
      login: 'john',
      email: 'john@example.com',
      password: 'hashed',
      age: 21,
      description: dto.description,
      deletedAt: null,
    });

    await service.putOne(2, dto);

    expect(repositoryMock.putUser).toHaveBeenCalledWith(2, dto);
  });

  it('deleteOne delegates to repository', async () => {
    repositoryMock.deleteUser.mockResolvedValue(undefined);

    await service.deleteOne(3);

    expect(repositoryMock.deleteUser).toHaveBeenCalledWith(3);
  });
});
