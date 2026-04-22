import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@pepe/auth/auth.guard';
import type { JwtPayload } from '@pepe/auth/auth.service';
import { CurrentUser } from '@pepe/common/decorators/current-user';
import type { IUploadedMulterFile } from '@pepe/providers/files/s3/interfaces/upload-file.interface';
import { AvatarsService } from './avatars.service';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@ApiTags('avatars')
@ApiBearerAuth()
@Controller('avatars')
@UseGuards(AuthGuard)
export class AvatarsController {
  constructor(private avatarsService: AvatarsService) {}

  @Get('me')
  getMyAvatars(@CurrentUser('sub') userId: number) {
    return this.avatarsService.listMyAvatars(userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  postAvatar(
    @UploadedFile(FileValidationPipe) file: IUploadedMulterFile,
    @CurrentUser() { login, sub }: JwtPayload,
  ) {
    return this.avatarsService.uploadAvatar(file, login, sub);
  }

  @Delete(':avatarId')
  @HttpCode(204)
  deleteAvatar(
    @Param('avatarId', ParseIntPipe) avatarId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.avatarsService.deleteAvatar(avatarId, userId);
  }
}
