-- ============================================================
-- 004: Parent/Teacher Dashboard — linking students to parents
-- ============================================================

-- parent_student_links
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Parents can see and manage their own links
CREATE POLICY "links_parent" ON public.parent_student_links
  FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "links_service" ON public.parent_student_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Parents can read stats of their linked students
CREATE POLICY "stats_parent_read" ON public.user_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links l
      WHERE l.parent_id = auth.uid() AND l.student_id = user_stats.user_id
    )
  );

CREATE POLICY "lc_parent_read" ON public.lesson_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links l
      WHERE l.parent_id = auth.uid() AND l.student_id = lesson_completions.user_id
    )
  );

CREATE POLICY "badges_parent_read" ON public.user_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links l
      WHERE l.parent_id = auth.uid() AND l.student_id = user_badges.user_id
    )
  );

-- Helper view for parent dashboard
CREATE OR REPLACE VIEW public.student_summary AS
SELECT
  p.id           AS student_id,
  p.display_name,
  p.age,
  p.age_group,
  s.total_xp,
  s.level,
  s.streak_days,
  s.last_active,
  COUNT(DISTINCT lc.topic_id) AS lessons_completed,
  COUNT(DISTINCT ub.badge_id) AS badges_earned
FROM public.profiles p
LEFT JOIN public.user_stats s ON s.user_id = p.id
LEFT JOIN public.lesson_completions lc ON lc.user_id = p.id
LEFT JOIN public.user_badges ub ON ub.user_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.display_name, p.age, p.age_group,
         s.total_xp, s.level, s.streak_days, s.last_active;
