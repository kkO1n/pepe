import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';

const paginatedUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  login: z.string().trim().min(1).max(50).optional(),
});

type PaginatedUsersQuery = z.infer<typeof paginatedUsersQuerySchema>;

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  getUsers(
    @Query(new ZodValidationPipe(paginatedUsersQuerySchema))
    query: PaginatedUsersQuery,
  ) {
    return this.usersService.findUsers(query);
  }
}
