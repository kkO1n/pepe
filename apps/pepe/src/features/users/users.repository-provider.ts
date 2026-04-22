import { IUserRepository } from '@pepe/common/interfaces/user-repository.interface';
import { UserRepository } from './users.repository';

export const usersRepositoryProvider = {
  provide: IUserRepository,
  useClass: UserRepository,
};
