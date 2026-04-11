import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/providers/databases/postgresql/postgresql.module';
import { FilesModule } from 'src/providers/files/files.module';
import { UsersModule } from '../users/users.module';
import { AvatarsController } from './avatars.controller';
import { avatarsRepositoryProvider } from './avatars.repository-provider';
import { AvatarsService } from './avatars.service';

@Module({
  imports: [FilesModule, UsersModule, DatabaseModule],
  providers: [avatarsRepositoryProvider, AvatarsService],
  controllers: [AvatarsController],
})
export class AvatarsModule {}
