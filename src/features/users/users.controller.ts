import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.findUsers(query);
  }

  @Put(':id')
  putUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() putUser: UpdateUserDto,
  ) {
    return this.usersService.putOne(id, putUser);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteOne(id);
  }
}
