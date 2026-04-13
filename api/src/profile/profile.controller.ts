import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /** Fetch the authenticated user's profile */
  @Get()
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.profileService.getProfile(userId);
  }

  /**
   * Called immediately after supabase.auth.signUp() on the frontend.
   * Seeds the profiles + user_stats rows with display_name and age.
   */
  @Post('init')
  @HttpCode(201)
  async initProfile(
    @Body() body: { displayName: string; age: number; username?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.profileService.initProfile({ userId, ...body });
  }

  /** Update display name, username or age */
  @Put()
  @HttpCode(200)
  async updateProfile(
    @Body() body: { displayName?: string; username?: string; age?: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.profileService.updateProfile({ userId, ...body });
  }
}
