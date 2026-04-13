import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('progress')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getStats(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.progressService.getStats(userId);
  }

  @Post('xp')
  @HttpCode(200)
  async awardXp(@Body() body: { amount: number; reason: string }, @Req() req: Request) {
    const userId = (req as any).user.id;
    return this.progressService.awardXp({ userId, amount: body.amount, reason: body.reason });
  }

  @Post('lesson')
  @HttpCode(200)
  async completeLesson(
    @Body() body: { subject: string; topicId: string; score: number; xpEarned: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.progressService.completeLesson({ userId, ...body });
  }

  @Post('badge')
  @HttpCode(200)
  async unlockBadge(
    @Body() body: { badgeId: string; xpReward: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.progressService.unlockBadge({ userId, ...body });
  }

  @Post('streak')
  @HttpCode(200)
  async updateStreak(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.progressService.updateStreak(userId);
  }
}
