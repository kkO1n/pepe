import { User } from 'src/features/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
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

  @ManyToOne(() => User, (user) => user.avatars, { onDelete: 'CASCADE' })
  user: User;
}
