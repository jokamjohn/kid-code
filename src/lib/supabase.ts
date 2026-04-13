/**
 * Browser-side Supabase client — AUTH ONLY.
 *
 * Do NOT call supabase.from() or any DB query from the frontend.
 * All database reads and writes go through /api/* (NestJS) so the
 * service-role key and RLS bypass stay server-side.
 *
 * Allowed browser operations:
 *   supabase.auth.signUp()
 *   supabase.auth.signInWithPassword()
 *   supabase.auth.signOut()
 *   supabase.auth.getSession()
 *   supabase.auth.onAuthStateChange()
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not set — auth features will be disabled in demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)
