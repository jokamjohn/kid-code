import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { TutorService, AgeGroup } from './tutor.service';
import { AuthGuard } from '../common/guards/auth.guard';

interface AskDto {
  question: string;
  context?: { ageGroup?: AgeGroup };
}

interface HintDto {
  code: string;
  challenge: string;
  context?: { ageGroup?: AgeGroup };
}

@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post()
  @HttpCode(200)
  async ask(@Body() body: AskDto, @Res() res: Response, @Req() req: Request) {
    const { question, context } = body;
    if (!question?.trim()) {
      res.status(400).json({ message: 'question is required' });
      return;
    }

    // Allow unauthenticated in demo mode; rate limit authenticated users
    const user = (req as any).user;
    const userId = user?.id ?? 'anonymous';

    if (user && !this.tutorService.checkDailyLimit(userId)) {
      throw new HttpException(
        'Daily limit reached (20 questions/day)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const ageGroup: AgeGroup = context?.ageGroup ?? 'middle';
    await this.tutorService.streamAnswer(question.trim(), ageGroup, userId, res);
  }

  @Post('hint')
  @HttpCode(200)
  async hint(@Body() body: HintDto, @Res() res: Response, @Req() req: Request) {
    const { code, challenge, context } = body;
    if (!code || !challenge) {
      res.status(400).json({ message: 'code and challenge are required' });
      return;
    }

    const user = (req as any).user;
    const userId = user?.id ?? 'anonymous';

    if (user && !this.tutorService.checkHintLimit(userId)) {
      throw new HttpException(
        'Hint limit reached (5 hints/hour)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const ageGroup: AgeGroup = context?.ageGroup ?? 'middle';
    await this.tutorService.streamHint(code, challenge, ageGroup, res);
  }
}
