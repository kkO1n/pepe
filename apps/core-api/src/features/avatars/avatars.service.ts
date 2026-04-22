import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAX_AVATARS_COUNT } from '@core-api/common/constants';
import { IAvatarsRepository } from '@core-api/common/interfaces/avatars-repository.interface';
import {
  FILE_SERVICE,
  type IFileService,
} from '@core-api/providers/files/files.adapter';
import type { IUploadedMulterFile } from '@core-api/providers/files/s3/interfaces/upload-file.interface';

@Injectable()
export class AvatarsService {
  constructor(
    @Inject(FILE_SERVICE) private readonly files: IFileService,
    private readonly avatarsRepository: IAvatarsRepository,
    private readonly configService: ConfigService,
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

    const created = await this.avatarsRepository.create({
      url: path,
      userId,
    });

    return {
      ...created,
      path: this.toPublicPath(created.path),
    };
  }

  async listMyAvatars(userId: number) {
    const avatars = await this.avatarsRepository.getAvatarsListByUserId(userId);

    return avatars.map((avatar) => ({
      ...avatar,
      path: this.toPublicPath(avatar.path),
    }));
  }

  async deleteAvatar(avatarId: number, requesterId: number) {
    const avatarMeta = await this.avatarsRepository.getAvatarMetaById(avatarId);
    if (!avatarMeta) throw new BadRequestException();

    if (avatarMeta.ownerId !== requesterId) {
      throw new ForbiddenException('You can only delete your own avatar');
    }

    await this.files.removeFile({ path: this.toObjectKey(avatarMeta.path) });

    return await this.avatarsRepository.softDelete(avatarId);
  }

  private toPublicPath(storedPath: string): string {
    if (/^https?:\/\//i.test(storedPath)) {
      return storedPath;
    }

    const configuredPublicBase =
      this.configService.get<string>('S3_PUBLIC_BASE_URL');

    if (configuredPublicBase) {
      return `${configuredPublicBase.replace(/\/$/, '')}/${storedPath}`;
    }

    const endpoint = this.configService
      .getOrThrow<string>('S3_ENDPOINT')
      .replace(/\/$/, '');
    const bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');

    return `${endpoint}/${bucketName}/${storedPath}`;
  }

  private toObjectKey(storedPath: string): string {
    if (!/^https?:\/\//i.test(storedPath)) {
      return storedPath;
    }

    const url = new URL(storedPath);
    const pathname = url.pathname.replace(/^\/+/, '');
    const bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');

    if (pathname.startsWith(`${bucketName}/`)) {
      return pathname.slice(bucketName.length + 1);
    }

    return pathname;
  }
}
