import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { FilesModule } from 'src/providers/files/files.module';

@Module({
  imports: [FilesModule],
  providers: [AvatarsService],
  controllers: [AvatarsController],
})
export class AvatarsModule {}
