import { Inject, Injectable } from '@nestjs/common';
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

  deleteAvatar(path: string) {
    return this.files.removeFile({
      path,
    });
  }
}
