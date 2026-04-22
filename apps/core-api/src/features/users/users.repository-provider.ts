import { IUserRepository } from '@core-api/common/interfaces/user-repository.interface';
import { UserRepository } from './users.repository';

export const usersRepositoryProvider = {
  provide: IUserRepository,
  useClass: UserRepository,
};
