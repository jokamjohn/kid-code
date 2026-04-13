import { atom } from 'jotai'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/user'

export const supabaseUserAtom = atom<User | null>(null)
export const profileAtom = atom<Profile | null>(null)
export const authLoadingAtom = atom(true)
