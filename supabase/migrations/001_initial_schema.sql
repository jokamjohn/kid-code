-- ============================================================
-- 001: Initial Schema — profiles, lesson_completions, xp_log, user_stats
-- ============================================================

-- profiles extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  display_name  TEXT,
  age           INTEGER CHECK (age BETWEEN 6 AND 18),
  age_group     TEXT CHECK (age_group IN ('young', 'middle', 'older')),
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher')),
  parent_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  github_username     TEXT,
  github_access_token TEXT,  -- encrypted via Supabase Vault in production
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, age, age_group)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    CASE
      WHEN (NEW.raw_user_meta_data->>'age')::INTEGER BETWEEN 6  AND 9  THEN 'young'
      WHEN (NEW.raw_user_meta_data->>'age')::INTEGER BETWEEN 10 AND 12 THEN 'middle'
      ELSE 'older'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- lesson_completions
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  topic_id     TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

-- xp_log
CREATE TABLE IF NOT EXISTS public.xp_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_stats (materialized summary — updated via API)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id     UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats        ENABLE ROW LEVEL SECURITY;

-- profiles: own row + parents see their children
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_parent_read" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('parent', 'teacher')
        AND public.profiles.parent_id = auth.uid()
    )
  );

-- lesson_completions / xp_log / user_stats: own data only
CREATE POLICY "lc_own" ON public.lesson_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "xp_own" ON public.xp_log            FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "stats_own" ON public.user_stats      FOR ALL USING (auth.uid() = user_id);

-- Service role can bypass RLS (API uses service role key)
CREATE POLICY "profiles_service" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "lc_service" ON public.lesson_completions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "xp_service" ON public.xp_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "stats_service" ON public.user_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);
