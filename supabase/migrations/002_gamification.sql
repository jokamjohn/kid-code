-- ============================================================
-- 002: Gamification — badge_definitions, user_badges, quiz tables
-- ============================================================

-- badge_definitions (seeded below)
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  xp_reward   INTEGER NOT NULL DEFAULT 0,
  category    TEXT NOT NULL CHECK (category IN ('learning', 'mastery', 'streak', 'project', 'quiz', 'special'))
);

-- user_badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL REFERENCES public.badge_definitions(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('multiple_choice', 'code_fill', 'match_pairs')),
  question    TEXT NOT NULL,
  options     JSONB,
  answer      TEXT NOT NULL,
  difficulty  INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  xp_reward   INTEGER NOT NULL DEFAULT 10
);

-- quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id   TEXT NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  answers    JSONB,
  xp_earned  INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_public_read"  ON public.badge_definitions FOR SELECT USING (true);
CREATE POLICY "user_badges_own"     ON public.user_badges       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "quiz_q_public"       ON public.quiz_questions    FOR SELECT USING (true);
CREATE POLICY "quiz_attempts_own"   ON public.quiz_attempts     FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "badge_def_service"   ON public.badge_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "user_badges_service" ON public.user_badges       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "quiz_q_service"      ON public.quiz_questions    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "quiz_attempts_svc"   ON public.quiz_attempts     FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed badge definitions
INSERT INTO public.badge_definitions (id, name, description, emoji, xp_reward, category) VALUES
  -- Learning badges
  ('first_lesson',    'First Step',       'Complete your very first lesson',       '🌱', 25,  'learning'),
  ('five_lessons',    'On a Roll',        'Complete 5 lessons',                    '📚', 50,  'learning'),
  ('twenty_lessons',  'Knowledge Seeker', 'Complete 20 lessons',                   '🎓', 150, 'learning'),
  ('all_html',        'HTML Master',      'Complete all HTML lessons',             '🏷️', 200, 'mastery'),
  ('all_css',         'Style Wizard',     'Complete all CSS lessons',              '🎨', 200, 'mastery'),
  ('all_js',          'JS Ninja',         'Complete all JavaScript lessons',       '⚡', 200, 'mastery'),
  ('all_computing',   'Tech Explorer',    'Complete all Computing lessons',        '💻', 200, 'mastery'),
  -- Streak badges
  ('streak_3',        'Hat Trick',        'Keep a 3-day learning streak',          '🔥', 30,  'streak'),
  ('streak_7',        'Week Warrior',     'Keep a 7-day learning streak',          '🏅', 75,  'streak'),
  ('streak_30',       'Monthly Legend',   'Keep a 30-day learning streak',         '🏆', 300, 'streak'),
  -- Project badges
  ('first_project',   'Builder',          'Create your first project',             '🔨', 50,  'project'),
  ('github_push',     'Open Sourcer',     'Push a project to GitHub',              '🐙', 75,  'project'),
  ('five_projects',   'Prolific Coder',   'Create 5 projects',                     '🚀', 150, 'project'),
  -- Quiz badges
  ('first_quiz',      'Quiz Taker',       'Complete your first quiz',              '📝', 25,  'quiz'),
  ('perfect_quiz',    'Perfectionist',    'Score 100% on a quiz',                  '💯', 100, 'quiz'),
  ('five_quizzes',    'Quiz Champion',    'Complete 5 quizzes',                    '🎯', 75,  'quiz'),
  -- Special badges
  ('early_bird',      'Early Bird',       'Sign up in the first month of launch',  '🐦', 100, 'special'),
  ('tutor_user',      'Curious Mind',     'Ask the AI Tutor 10 questions',         '🤖', 50,  'special'),
  ('night_owl',       'Night Owl',        'Learn after 9pm',                       '🦉', 25,  'special'),
  ('block_coder',     'Block Master',     'Build a program in the Block Editor',   '🧩', 50,  'special')
ON CONFLICT (id) DO NOTHING;
