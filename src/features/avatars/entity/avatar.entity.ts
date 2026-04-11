import { User } from '../../users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('avatar')
@Index('idx_avatar_user_id', ['userId'])
export class Avatar {
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

  @ManyToOne(() => User, (user) => user.avatars, { onDelete: 'CASCADE' })
  user: User;
}
