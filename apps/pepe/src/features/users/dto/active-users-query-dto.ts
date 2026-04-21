import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ActiveUsersQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAge: number;
}
