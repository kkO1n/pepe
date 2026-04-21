import { Avatar } from '../../avatars/entity/avatar.entity';
import {
  Check,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
@Index('idx_user_login_age_id', ['login', 'age', 'id'])
export class User {
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

  @Check('balance >= 0')
  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 1000 })
  description: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Avatar, (avatar) => avatar.user)
  avatars?: Avatar[];
}
