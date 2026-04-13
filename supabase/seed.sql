-- ============================================================
-- Seed: local dev test users
-- Applied by db-migrate after all migrations
-- ============================================================

-- Insert test users directly into auth.users (bypasses email confirmation)
-- Passwords are bcrypt of "password123"
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'student@kidcode.local',
    '$2a$10$PnjCBsFqTXkMOtE4kTdcBuCsAt.uyLxcFHfIzfLrqc9ky1k/DLJVG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Alex Student","age":11}',
    false,
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'parent@kidcode.local',
    '$2a$10$PnjCBsFqTXkMOtE4kTdcBuCsAt.uyLxcFHfIzfLrqc9ky1k/DLJVG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Parent User","age":35}',
    false,
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Profiles (trigger may have already created these; upsert is safe)
INSERT INTO public.profiles (id, display_name, age, age_group, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Student', 11, 'middle', 'student'),
  ('00000000-0000-0000-0000-000000000002', 'Parent User',  35, 'older',  'parent')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  age          = EXCLUDED.age,
  age_group    = EXCLUDED.age_group,
  role         = EXCLUDED.role;

-- Initial stats
INSERT INTO public.user_stats (user_id, total_xp, level, streak_days)
VALUES
  ('00000000-0000-0000-0000-000000000001', 0, 1, 0),
  ('00000000-0000-0000-0000-000000000002', 0, 1, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Link parent → student
INSERT INTO public.parent_student_links (parent_id, student_id)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
