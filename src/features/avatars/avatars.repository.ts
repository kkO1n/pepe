import { Inject } from '@nestjs/common';
import { DATA_SOURCE } from 'src/common/constants';
import type { IAvatarsRepository } from 'src/common/interfaces/avatars-repository.interface';
import type { DataSource, EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { Avatars } from './entity/avatars.entity';

export class AvatarsRepository
  extends BaseRepository
  implements IAvatarsRepository
{
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    super(dataSource);
  }

  private avatarsRepository(
    entityManager?: EntityManager,
  ): Repository<Avatars> {
    return this.getRepository(Avatars, entityManager);
  }

  async create(dto: Partial<Avatars>) {
    const createdAvatar = await this.avatarsRepository().save(dto);

    return { path: createdAvatar.url, avatarId: createdAvatar.id };
  }

  async softDelete(avatarId: number) {
    await this.avatarsRepository().softDelete(avatarId);
  }

  async getPathByAvatarId(avatarId: number): Promise<string | null> {
    const avatar = await this.avatarsRepository().findOne({
      where: { id: avatarId },
    });

    if (!avatar) return null;

    return avatar?.url;
  }
}
