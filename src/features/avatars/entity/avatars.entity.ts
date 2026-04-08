import { Users } from 'src/features/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('avatars')
@Index('idx_avatars_user_id', ['userId'])
export class Avatars {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('text')
  url: string;

  @Column('boolean', { default: false })
  isPrimary?: boolean;

  @CreateDateColumn()
  createdAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Users, (user) => user.avatars, { onDelete: 'CASCADE' })
  user: Users;
}
