import type { Avatars } from 'src/features/avatars/entity/avatars.entity';

export abstract class IAvatarsRepository {
  abstract create(
    avatar: Partial<Avatars>,
  ): Promise<{ path: string; avatarId: number }>;
  abstract softDelete(avatarId: number): Promise<void>;
  abstract getAvatarMetaById(
    avatarId: number,
  ): Promise<{ path: string; ownerId: number } | null>;
  abstract getAvatarsByUserId(userId: number): Promise<[Avatars[], number]>;
}
