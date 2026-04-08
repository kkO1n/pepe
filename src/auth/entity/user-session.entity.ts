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
import { Users } from '../../features/users/entity/user.entity';

@Entity('user_sessions')
@Unique('UQ_user_sessions_user_id', ['userId'])
@Unique('UQ_user_sessions_refresh_token', ['refreshToken'])
@Index('IDX_user_sessions_expires_at', ['expiresAt'])
export class UserSessions {
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

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;
}
