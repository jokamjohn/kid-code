import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface AwardXpInput {
  userId: string;
  amount: number;
  reason: string;
}

export interface CompleteLessonInput {
  userId: string;
  subject: string;
  topicId: string;
  score: number;
  xpEarned: number;
}

export interface CheckBadgeInput {
  userId: string;
  badgeId: string;
  xpReward: number;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000];

function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async awardXp(input: AwardXpInput): Promise<{ totalXp: number; level: number }> {
    const { userId, amount, reason } = input;

    await this.supabase.admin.from('xp_log').insert({ user_id: userId, amount, reason });

    const { data: stats } = await this.supabase.admin
      .from('user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    const currentXp = (stats as any)?.total_xp ?? 0;
    const newXp = currentXp + amount;
    const newLevel = getLevelFromXp(newXp);

    await this.supabase.admin
      .from('user_stats')
      .upsert({ user_id: userId, total_xp: newXp, level: newLevel, last_active: new Date().toISOString() });

    this.logger.log(`XP: ${userId} +${amount} (${reason}) → ${newXp}`);
    return { totalXp: newXp, level: newLevel };
  }

  async completeLesson(input: CompleteLessonInput): Promise<{ totalXp: number; level: number }> {
    const { userId, subject, topicId, score, xpEarned } = input;

    await this.supabase.admin.from('lesson_completions').upsert(
      { user_id: userId, subject, topic_id: topicId, score, xp_earned: xpEarned },
      { onConflict: 'user_id,topic_id' },
    );

    return this.awardXp({ userId, amount: xpEarned, reason: `lesson:${topicId}` });
  }

  async unlockBadge(input: CheckBadgeInput): Promise<{ alreadyHad: boolean }> {
    const { userId, badgeId, xpReward } = input;

    const { data: existing } = await this.supabase.admin
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existing) return { alreadyHad: true };

    await this.supabase.admin
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId });

    if (xpReward > 0) {
      await this.awardXp({ userId, amount: xpReward, reason: `badge:${badgeId}` });
    }

    return { alreadyHad: false };
  }

  async updateStreak(userId: string): Promise<{ streakDays: number }> {
    const { data: stats } = await this.supabase.admin
      .from('user_stats')
      .select('streak_days, last_active')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    let newStreak = 1;

    if (stats) {
      const lastActive = (stats as any).last_active ? new Date((stats as any).last_active) : null;
      const current = (stats as any).streak_days ?? 1;
      if (lastActive) {
        const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / 86400000);
        if (diffDays === 0) newStreak = current;
        else if (diffDays === 1) newStreak = current + 1;
        else newStreak = 1;
      }
    }

    await this.supabase.admin.from('user_stats').upsert({
      user_id: userId,
      streak_days: newStreak,
      last_active: now.toISOString(),
    });

    return { streakDays: newStreak };
  }

  async getStats(userId: string) {
    const [statsRes, badgesRes, completionsRes] = await Promise.all([
      this.supabase.admin.from('user_stats').select('*').eq('user_id', userId).single(),
      this.supabase.admin.from('user_badges').select('badge_id, earned_at').eq('user_id', userId),
      this.supabase.admin
        .from('lesson_completions')
        .select('topic_id, subject, score, xp_earned, completed_at')
        .eq('user_id', userId),
    ]);

    return {
      stats: statsRes.data,
      badges: badgesRes.data,
      completions: completionsRes.data,
    };
  }
}
