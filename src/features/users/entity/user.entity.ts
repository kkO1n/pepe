import { Avatars } from 'src/features/avatars/entity/avatars.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
@Index('idx_users_login_age_id', ['login', 'age', 'id'])
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('int')
  age: number;

  @Column({ length: 1000 })
  description: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Avatars, (avatar) => avatar.user)
  avatars?: Avatars[];
}
