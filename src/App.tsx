import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/apiClient'
import { supabaseUserAtom, authLoadingAtom, profileAtom } from '@/atoms/userAtoms'
import { darkModeAtom, applyDarkMode } from '@/atoms/themeAtoms'
import {
  userStatsAtom,
  userBadgesAtom,
  lessonCompletionsAtom,
} from '@/atoms/progressAtoms'

import { AppShell } from '@/components/layout/AppShell'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Learn from '@/pages/Learn'
import LearnSubject from '@/pages/LearnSubject'
import LearnTopic from '@/pages/LearnTopic'
import Playground from '@/pages/Playground'
import Blocks from '@/pages/Blocks'
import Projects from '@/pages/Projects'
import Tutor from '@/pages/Tutor'
import Achievements from '@/pages/Achievements'
import Settings from '@/pages/Settings'

function App() {
  const [, setUser] = useAtom(supabaseUserAtom)
  const [, setAuthLoading] = useAtom(authLoadingAtom)
  const [dark] = useAtom(darkModeAtom)
  const setProfile = useSetAtom(profileAtom)
  const setStats = useSetAtom(userStatsAtom)
  const setBadges = useSetAtom(userBadgesAtom)
  const setCompletions = useSetAtom(lessonCompletionsAtom)

  useEffect(() => {
    applyDarkMode(dark)
  }, [dark])

  /** Load all user data from the API after successful auth */
  async function loadUserData() {
    try {
      const [profileData, progressData] = await Promise.all([
        apiClient.get<any>('/api/profile'),
        apiClient.get<any>('/api/progress'),
      ])

      // Map snake_case API response to camelCase Profile type
      setProfile({
        id: profileData.id,
        username: profileData.username ?? '',
        displayName: profileData.display_name ?? '',
        age: profileData.age ?? 0,
        ageGroup: profileData.age_group ?? 'middle',
        role: profileData.role ?? 'student',
        githubUsername: profileData.github_username ?? undefined,
        createdAt: profileData.created_at,
      })

      if (progressData.stats) {
        setStats({
          totalXp: progressData.stats.total_xp ?? 0,
          level: progressData.stats.level ?? 1,
          streakDays: progressData.stats.streak_days ?? 0,
          lastActive: progressData.stats.last_active ?? new Date().toISOString(),
        })
      }

      if (progressData.badges) {
        setBadges(
          progressData.badges.map((b: any) => ({
            badgeId: b.badge_id,
            earnedAt: b.earned_at,
          })),
        )
      }

      if (progressData.completions) {
        setCompletions(
          progressData.completions.map((c: any) => ({
            userId: profileData.id,
            subjectId: c.subject,
            topicId: c.topic_id,
            score: c.score,
            xpEarned: c.xp_earned,
            completedAt: c.completed_at,
          })),
        )
      }

      // Update streak on each login
      apiClient.post('/api/progress/streak').catch(() => {})
    } catch {
      // API may not be running (demo mode) — silently ignore
    }
  }

  /** Reset all user atoms on sign-out */
  function clearUserData() {
    setProfile(null)
    setStats({ totalXp: 0, level: 1, streakDays: 0, lastActive: new Date().toISOString() })
    setBadges([])
    setCompletions([])
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
      if (data.session?.user) loadUserData()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData()
      } else {
        clearUserData()
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App (sidebar layout) */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:subjectId" element={<LearnSubject />} />
          <Route path="/learn/:subjectId/:topicId" element={<LearnTopic />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
