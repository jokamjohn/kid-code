import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [GithubController],
  providers: [GithubService, SupabaseService],
})
export class GithubModule {}
