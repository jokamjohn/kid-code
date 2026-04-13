import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface InitProfileInput {
  userId: string;
  displayName: string;
  age: number;
  username?: string;
}

export interface UpdateProfileInput {
  userId: string;
  displayName?: string;
  username?: string;
  age?: number;
}

@Injectable()
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('id, username, display_name, age, age_group, role, github_username, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Profile not found');
    return data;
  }

  async initProfile(input: InitProfileInput) {
    const ageGroup =
      input.age <= 9 ? 'young' : input.age <= 12 ? 'middle' : 'older';

    const { data, error } = await this.supabase.admin
      .from('profiles')
      .upsert(
        {
          id: input.userId,
          display_name: input.displayName,
          age: input.age,
          age_group: ageGroup,
          username: input.username ?? null,
          role: 'student',
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (error) throw error;

    // Seed user_stats row
    await this.supabase.admin
      .from('user_stats')
      .upsert({ user_id: input.userId, total_xp: 0, level: 1, streak_days: 0 });

    return data;
  }

  async updateProfile(input: UpdateProfileInput) {
    const updates: Record<string, unknown> = {};
    if (input.displayName !== undefined) updates.display_name = input.displayName;
    if (input.username !== undefined) updates.username = input.username;
    if (input.age !== undefined) {
      updates.age = input.age;
      updates.age_group =
        input.age <= 9 ? 'young' : input.age <= 12 ? 'middle' : 'older';
    }

    const { data, error } = await this.supabase.admin
      .from('profiles')
      .update(updates)
      .eq('id', input.userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
