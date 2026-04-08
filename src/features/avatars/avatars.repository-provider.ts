import { IAvatarsRepository } from 'src/common/interfaces/avatars-repository.interface';
import { AvatarsRepository } from './avatars.repository';

export const avatarsRepositoryProvider = {
  provide: IAvatarsRepository,
  useClass: AvatarsRepository,
};
