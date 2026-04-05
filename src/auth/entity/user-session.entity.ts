import { User } from '../../features/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
@Unique('UQ_user_sessions_user_id', ['userId'])
@Unique('UQ_user_sessions_refresh_token', ['refreshToken'])
@Index('IDX_user_sessions_expires_at', ['expiresAt'])
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column()
  refreshToken: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
