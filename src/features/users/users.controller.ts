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
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { type PutUserDto, putUserSchema } from './dto/put-user-dto';

const paginatedUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  login: z.string().trim().min(1).max(50).optional(),
});

type PaginatedUsersQuery = z.infer<typeof paginatedUsersQuerySchema>;

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(
    @Query(new ZodValidationPipe(paginatedUsersQuerySchema))
    query: PaginatedUsersQuery,
  ) {
    return this.usersService.findUsers(query);
  }

  @Put(':id')
  putUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(putUserSchema)) putUser: PutUserDto,
  ) {
    return this.usersService.putOne(id, putUser);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param('id', ParseIntPipe) id: number): void {
    return this.usersService.deleteOne(id);
  }
}
