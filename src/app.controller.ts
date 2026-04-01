import {
  ConflictException,
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, type RequestWithUser } from './auth/auth.guard';
import { UsersService } from './features/users/users.service';

@ApiTags('profile')
@Controller()
export class AppController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile/my')
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.getPublicUserByLogin(req.user.login);

    if (!user) throw new ConflictException();

    return user;
  }
}
