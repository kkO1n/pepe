import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new AWS.S3({
          endpoint: 'http://127.0.0.1:9000',
          region: 'ru-central1',
          credentials: {
            accessKeyId: config.getOrThrow('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow('S3_SECRET_ACCESS_KEY'),
          },
        });
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
