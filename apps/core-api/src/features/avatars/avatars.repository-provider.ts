import { IAvatarsRepository } from '@core-api/common/interfaces/avatars-repository.interface';
import { AvatarsRepository } from './avatars.repository';

export const avatarsRepositoryProvider = {
  provide: IAvatarsRepository,
  useClass: AvatarsRepository,
};
