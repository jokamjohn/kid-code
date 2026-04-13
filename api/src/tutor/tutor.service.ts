import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';

export type AgeGroup = 'young' | 'middle' | 'older';

// Per-user rate limiting: track daily call counts in memory (reset at midnight UTC)
const dailyCounts = new Map<string, { count: number; date: string }>();
const DAILY_LIMIT = 20;
const HINT_LIMIT = 5;
const hintCounts = new Map<string, { count: number; hour: string }>();

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}
function currentHourUTC() {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)}-${d.getUTCHours()}`;
}

const SYSTEM_PROMPT_BY_AGE: Record<AgeGroup, string> = {
  young: `You are Spark, a friendly and encouraging coding tutor for kids aged 6-9.
Use very simple words, short sentences, and lots of fun emojis! 🌟
Compare coding concepts to things kids know: toys, games, cartoons, animals.
Keep answers SHORT (2-4 sentences max unless showing code).
Always end with encouragement like "You're doing amazing!" or "Great question!".
NEVER use jargon without explaining it. Focus on HTML basics and simple concepts.
Only answer coding and computer-related questions. For other topics, gently redirect.`,

  middle: `You are Spark, an enthusiastic coding tutor for kids aged 10-12.
Be friendly, use clear explanations, and include fun examples. Use some emojis.
You can introduce variables, loops, functions, HTML, CSS, and basic JavaScript.
Keep answers focused and practical — show short code examples when helpful.
Use analogies to games, YouTube, or things they build.
Only answer coding and computer-related questions. For other topics, gently redirect.`,

  older: `You are Spark, a capable coding mentor for teens aged 13-14.
Be clear, direct, and thorough. Use technical terms but always explain them.
You can discuss HTML, CSS, JavaScript, basic programming concepts, and web development.
Show code examples with brief explanations. Encourage building real projects.
Only answer coding and computer-related questions. For other topics, gently redirect.`,
};

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  checkDailyLimit(userId: string): boolean {
    const today = todayUTC();
    const entry = dailyCounts.get(userId);
    if (!entry || entry.date !== today) {
      dailyCounts.set(userId, { count: 1, date: today });
      return true;
    }
    if (entry.count >= DAILY_LIMIT) return false;
    entry.count++;
    return true;
  }

  checkHintLimit(userId: string): boolean {
    const hour = currentHourUTC();
    const entry = hintCounts.get(userId);
    if (!entry || entry.hour !== hour) {
      hintCounts.set(userId, { count: 1, hour });
      return true;
    }
    if (entry.count >= HINT_LIMIT) return false;
    entry.count++;
    return true;
  }

  async streamAnswer(
    question: string,
    ageGroup: AgeGroup,
    userId: string,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const systemPrompt = SYSTEM_PROMPT_BY_AGE[ageGroup] ?? SYSTEM_PROMPT_BY_AGE.middle;

    try {
      const stream = this.anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' } as any,
          },
        ],
        messages: [{ role: 'user', content: question }],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const chunk = JSON.stringify({ text: event.delta.text });
          res.write(`data: ${chunk}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
    } catch (err) {
      this.logger.error('Anthropic stream error', err);
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    } finally {
      res.end();
    }
  }

  async streamHint(
    code: string,
    challenge: string,
    ageGroup: AgeGroup,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const systemPrompt = SYSTEM_PROMPT_BY_AGE[ageGroup] ?? SYSTEM_PROMPT_BY_AGE.middle;
    const hintPrompt = `The student is working on this challenge: "${challenge}"\n\nHere is their current code:\n\`\`\`\n${code}\n\`\`\`\n\nGive ONE short, encouraging hint to help them move forward. Don't give the answer — just nudge them in the right direction! Keep it to 2-3 sentences max.`;

    try {
      const stream = this.anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' } as any,
          },
        ],
        messages: [{ role: 'user', content: hintPrompt }],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
    } catch (err) {
      this.logger.error('Hint stream error', err);
      res.write(`data: ${JSON.stringify({ error: 'Hint failed' })}\n\n`);
    } finally {
      res.end();
    }
  }
}
