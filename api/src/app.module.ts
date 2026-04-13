import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TutorModule } from './tutor/tutor.module';
import { GithubModule } from './github/github.module';
import { ProgressModule } from './progress/progress.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [TutorModule, GithubModule, ProgressModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
