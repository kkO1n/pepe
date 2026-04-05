import { IsEmail, IsInt, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  age: number;

  @IsString()
  @MaxLength(1000)
  description: string;
}
