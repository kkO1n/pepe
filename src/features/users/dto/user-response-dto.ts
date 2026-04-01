import { Expose, Type } from 'class-transformer';

class UserResponseDto {
  @Expose() id: number;
  @Expose() login: string;
  @Expose() email: string;
  @Expose() age: number;
  @Expose() description: string;
}

class PaginatedUsersResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  data: UserResponseDto[];

  @Expose()
  total: number;
}
export { UserResponseDto, PaginatedUsersResponseDto };
