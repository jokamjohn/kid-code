import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { supabaseUserAtom, authLoadingAtom } from '@/atoms/userAtoms'
import { darkModeAtom, applyDarkMode } from '@/atoms/themeAtoms'

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

  useEffect(() => {
    applyDarkMode(dark)
  }, [dark])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser, setAuthLoading])

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
