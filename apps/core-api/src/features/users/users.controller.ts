import { CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core-api/auth/auth.guard';
import { CurrentUser } from '@core-api/common/decorators/current-user';
import { ActiveUsersQueryDto } from './dto/active-users-query-dto';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { TransferDto } from './dto/transfer-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UsersCacheInterceptor } from './interceptors/users-cache.interceptor';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseInterceptors(UsersCacheInterceptor)
  @CacheTTL(30)
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  @UseInterceptors(UsersCacheInterceptor)
  @CacheTTL(30)
  async getProfile(@CurrentUser('login') login: string) {
    return await this.usersService.getPublicUserByLogin(login);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('me/transfers')
  async transfer(@CurrentUser('sub') authId: number, @Body() dto: TransferDto) {
    return this.usersService.transfer(authId, dto.recipientId, dto.amount);
  }

  @Get('active')
  getActiveUsers(@Query() query: ActiveUsersQueryDto) {
    return this.usersService.listActiveUsers(query);
  }

  @Put(':id')
  putUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() putUser: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, putUser);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
