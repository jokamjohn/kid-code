import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.projectsService.listProjects(userId);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.projectsService.getProject(id, userId);
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body() body: { name: string; type: 'html' | 'javascript' | 'css' | 'blocks' },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectsService.createProject({ userId, ...body });
  }

  @Put(':id/files')
  @HttpCode(200)
  async upsertFile(
    @Param('id') projectId: string,
    @Body() body: { filename: string; content: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.projectsService.upsertFile({ projectId, userId, ...body });
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.projectsService.deleteProject(id, userId);
  }

  @Post(':id/github-repo')
  @HttpCode(200)
  async setGithubRepo(
    @Param('id') id: string,
    @Body() body: { repoName: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    await this.projectsService.setGithubRepo(id, userId, body.repoName);
    return { ok: true };
  }
}
