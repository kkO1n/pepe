import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type RequestWithUser } from './auth/auth.guard';
import { UsersService } from './features/users/users.service';

@Controller()
export class AppController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile/my')
  async getProfile(@Req() req: RequestWithUser) {
    return await this.usersService.findOne(req.user.login);
  }
}
