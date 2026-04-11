import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = /^image\/(jpeg|png)$/i;

@Injectable()
export class FileValidationPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({
          maxSize: MAX_AVATAR_SIZE_BYTES,
          message: 'Avatar size must be <= 10MB',
        }),
        new FileTypeValidator({
          fileType: ALLOWED_AVATAR_MIME_TYPES,
          errorMessage: 'Only JPEG and PNG files are allowed',
        }),
      ],
      fileIsRequired: true,
    });
  }
}
