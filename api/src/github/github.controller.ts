import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GithubService } from './github.service';
import { AuthGuard } from '../common/guards/auth.guard';

interface PushDto {
  repoName: string;
  commitMessage: string;
  files: { filename: string; content: string }[];
}

interface CreateRepoDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  /** Step 1: OAuth callback — exchange code for token, store in Supabase, redirect to settings */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const spaOrigin = process.env.SPA_ORIGIN ?? 'http://localhost:5173';

    if (!code) {
      return res.redirect(`${spaOrigin}/settings?github=error`);
    }

    try {
      const token = await this.githubService.exchangeCodeForToken(code, state);
      const username = await this.githubService.getGithubUsername(token);

      // At this point we don't have the user's session — the frontend must pass the
      // token back to /api/github/connect with their auth header.
      // Redirect to the SPA with the temp token in the hash (stays client-side only).
      return res.redirect(
        `${spaOrigin}/settings?github=connected&gh_token=${encodeURIComponent(token)}&gh_username=${encodeURIComponent(username)}`,
      );
    } catch (err) {
      return res.redirect(`${spaOrigin}/settings?github=error`);
    }
  }

  /** Step 2: Frontend sends the token + auth header to persist it server-side */
  @Post('connect')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async connect(
    @Body() body: { githubToken: string; githubUsername: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    await this.githubService.saveGithubToken(userId, body.githubToken, body.githubUsername);
    return { ok: true };
  }

  @Get('repos')
  @UseGuards(AuthGuard)
  async repos(@Req() req: Request) {
    const userId = (req as any).user.id;
    const repos = await this.githubService.listRepos(userId);
    return { repos };
  }

  @Post('repo')
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async createRepo(@Body() body: CreateRepoDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    const result = await this.githubService.createRepo({
      ...body,
      userId,
    });
    return result;
  }

  @Post('push')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async push(@Body() body: PushDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    const result = await this.githubService.pushFiles({
      ...body,
      userId,
    });
    return result;
  }
}
