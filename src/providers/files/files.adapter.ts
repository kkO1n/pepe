import type { RemoveFilePayloadDto } from './s3/dto/remove-file-payload.dto';
import type { UploadFilePayloadDto } from './s3/dto/upload-file-payload.dto';
import type { UploadFileResultDto } from './s3/dto/upload-file-result.dto';

export interface IFileService {
  uploadFile(dto: UploadFilePayloadDto): Promise<UploadFileResultDto>;
  removeFile(dto: RemoveFilePayloadDto): Promise<void>;
}
export const FILE_SERVICE = Symbol('FILE_SERVICE');
