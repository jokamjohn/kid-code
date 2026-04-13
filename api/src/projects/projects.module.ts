import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, SupabaseService],
})
export class ProjectsModule {}
