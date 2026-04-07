import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { AvatarsService } from './avatars.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('avatars')
@UseGuards(AuthGuard)
export class AvatarsController {
  constructor(private avatarsService: AvatarsService) {}

  @Post()
  postAvatar() {}

  @Delete()
  deleteAvatar() {}
}
