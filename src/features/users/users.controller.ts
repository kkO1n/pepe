import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
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
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { TransferDto } from './dto/transfer-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @CacheKey('users:list')
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @CacheKey('users:me')
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
  getActiveUsers(
    @Query('minAge', ParseIntPipe) minAge: number,
    @Query('maxAge', ParseIntPipe) maxAge: number,
  ) {
    return this.usersService.listActiveUsers(minAge, maxAge);
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
