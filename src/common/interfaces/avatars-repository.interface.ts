import type { Avatars } from 'src/features/avatars/entity/avatars.entity';

export abstract class IAvatarsRepository {
  abstract create(
    avatar: Partial<Avatars>,
  ): Promise<{ path: string; avatarId: number }>;
  abstract softDelete(avatarId: number): Promise<void>;
  abstract getPathByAvatarId(avatarId: number): Promise<string | null>;
  abstract getAvatarsByUserId(userId: number): Promise<[Avatars[], number]>;
}
