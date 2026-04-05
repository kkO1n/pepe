import { IUserSessionRepository } from 'src/common/interfaces/user-session-repository.interface';
import { UserSessionRepository } from './user-session.repository';

export const userSessionRepositoryProvider = {
  provide: IUserSessionRepository,
  useClass: UserSessionRepository,
};
