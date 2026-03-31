import { CreateUserDto } from 'src/features/users/dto/create-user-dto';
import { User } from 'src/features/users/entity/user.entity';

export abstract class IUserRepository {
  abstract findUsers(): Promise<[User[], number]>;
  abstract findUserById(userId: number): Promise<User | null>;
  abstract findUserByLogin(login: string): Promise<User | null>;
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
}
