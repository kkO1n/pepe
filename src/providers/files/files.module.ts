import { Module } from '@nestjs/common';

import { FILE_SERVICE } from './files.adapter';
import { S3Module } from './s3/s3.module';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [S3Module],
  providers: [{ provide: FILE_SERVICE, useClass: S3Service }],
  exports: [FILE_SERVICE],
})
export class FilesModule {}
