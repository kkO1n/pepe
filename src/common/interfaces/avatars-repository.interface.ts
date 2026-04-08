import type { Avatars } from 'src/features/avatars/entity/avatars.entity';

export abstract class IAvatarsRepository {
  abstract create(avatar: Partial<Avatars>): Promise<{ path: string }>;
}
