import { IUserSessionRepository } from '@core-api/common/interfaces/user-session-repository.interface';
import { UserSessionRepository } from './user-session.repository';

export const userSessionRepositoryProvider = {
  provide: IUserSessionRepository,
  useClass: UserSessionRepository,
};
