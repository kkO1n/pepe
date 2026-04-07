import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      useFactory: () => {
        return new AWS.S3({
          endpoint: 'http://127.0.0.1:9000',
          region: 'ru-central1',
          credentials: {
            accessKeyId: '20DEL7L8C9TMIM2TL6T7',
            secretAccessKey: 'wOauR+lhOYHpljy+UPylLAvTiQouz+AdyieaOAPp',
          },
        });
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
