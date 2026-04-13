-- ============================================================
-- 003: Projects — projects, project_files
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('html', 'javascript', 'css', 'blocks')),
  github_repo    TEXT,
  last_pushed_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_files (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filename   TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, filename)
);

-- Index for fast project file lookups
CREATE INDEX IF NOT EXISTS project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS projects_user_id ON public.projects(user_id);

-- RLS
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_own"      ON public.projects      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "project_files_own" ON public.project_files FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_files.project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "projects_service"      ON public.projects      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "project_files_service" ON public.project_files FOR ALL TO service_role USING (true) WITH CHECK (true);
