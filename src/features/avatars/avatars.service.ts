import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { MAX_AVATARS_COUNT } from 'src/common/constants';
import { IAvatarsRepository } from 'src/common/interfaces/avatars-repository.interface';
import {
  FILE_SERVICE,
  type IFileService,
} from 'src/providers/files/files.adapter';
import type { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';

@Injectable()
export class AvatarsService {
  constructor(
    @Inject(FILE_SERVICE) private readonly files: IFileService,
    private readonly avatarsRepository: IAvatarsRepository,
  ) {}

  async uploadAvatar(file: IUploadedMulterFile, login: string, userId: number) {
    const [, avatarsCount] =
      await this.avatarsRepository.getAvatarsByUserId(userId);
    if (avatarsCount >= MAX_AVATARS_COUNT)
      throw new ConflictException(
        `You can upload up to ${MAX_AVATARS_COUNT} avatars.`,
      );

    const fileKey = crypto.randomUUID();

    const { path } = await this.files.uploadFile({
      file,
      folder: `${login}/avatars`,
      name: fileKey,
    });

    return await this.avatarsRepository.create({
      url: path,
      userId,
    });
  }

  async deleteAvatar(avatarId: number, requesterId: number) {
    const avatarMeta = await this.avatarsRepository.getAvatarMetaById(avatarId);
    if (!avatarMeta) throw new BadRequestException();

    if (avatarMeta.ownerId !== requesterId) {
      throw new ForbiddenException('You can only delete your own avatar');
    }

    await this.files.removeFile({ path: avatarMeta.path });

    return await this.avatarsRepository.softDelete(avatarId);
  }
}
