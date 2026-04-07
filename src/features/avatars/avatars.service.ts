import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_SERVICE,
  type IFileService,
} from 'src/providers/files/files.adapter';

@Injectable()
export class AvatarsService {
  constructor(@Inject(FILE_SERVICE) private readonly files: IFileService) {}
}
