import type { Avatar } from '@pepe/features/avatars/entity/avatar.entity';

export type UserAvatarListItem = {
  avatarId: number;
  path: string;
  createdAt: Date | null;
  isPrimary?: boolean;
};

export abstract class IAvatarsRepository {
  abstract create(
    avatar: Partial<Avatar>,
  ): Promise<{ path: string; avatarId: number }>;
  abstract softDelete(avatarId: number): Promise<void>;
  abstract getAvatarMetaById(
    avatarId: number,
  ): Promise<{ path: string; ownerId: number } | null>;
  abstract getAvatarsByUserId(userId: number): Promise<[Avatar[], number]>;
  abstract getAvatarsListByUserId(
    userId: number,
  ): Promise<UserAvatarListItem[]>;
}
