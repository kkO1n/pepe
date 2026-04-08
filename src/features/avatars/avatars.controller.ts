import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import type { JwtPayload } from 'src/auth/auth.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import type { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';
import { AvatarsService } from './avatars.service';

@ApiTags('avatars')
@ApiBearerAuth()
@Controller('avatars')
@UseGuards(AuthGuard)
export class AvatarsController {
  constructor(private avatarsService: AvatarsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  postAvatar(
    @UploadedFile() file: IUploadedMulterFile,
    @CurrentUser() { login, sub }: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException();
    }

    return this.avatarsService.uploadAvatar(file, login, sub);
  }
}
