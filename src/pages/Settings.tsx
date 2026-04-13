import { useAtom, useSetAtom } from 'jotai'
import { motion } from 'framer-motion'
import { Moon, Sun, Github, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { darkModeAtom, applyDarkMode } from '@/atoms/themeAtoms'
import { profileAtom } from '@/atoms/userAtoms'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/apiClient'
import { useNavigate } from 'react-router-dom'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID

export default function Settings() {
  const [dark, setDark] = useAtom(darkModeAtom)
  const [profile] = useAtom(profileAtom)
  const setProfile = useSetAtom(profileAtom)
  const navigate = useNavigate()
  const [githubConnecting, setGithubConnecting] = useState(false)

  // Handle GitHub OAuth redirect: /settings?github=connected&gh_token=...&gh_username=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') !== 'connected') return

    const ghToken = params.get('gh_token')
    const ghUsername = params.get('gh_username')
    if (!ghToken || !ghUsername) return

    setGithubConnecting(true)
    // Clean up the query string immediately so a reload doesn't re-trigger
    history.replaceState({}, '', '/settings')

    apiClient.post('/api/github/connect', { githubToken: ghToken, githubUsername: ghUsername })
      .then(() => apiClient.get<any>('/api/profile'))
      .then(data => {
        setProfile({
          id: data.id,
          username: data.username ?? '',
          displayName: data.display_name ?? '',
          age: data.age ?? 0,
          ageGroup: data.age_group ?? 'middle',
          role: data.role ?? 'student',
          githubUsername: data.github_username ?? undefined,
          createdAt: data.created_at,
        })
      })
      .catch(() => { /* Non-fatal */ })
      .finally(() => setGithubConnecting(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function connectGitHub() {
    if (!GITHUB_CLIENT_ID) { alert('GitHub Client ID not configured in .env'); return }
    const redirectUri = `${window.location.origin}/api/github/callback`
    const state = crypto.randomUUID()
    sessionStorage.setItem('gh_state', state)
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_repo&state=${state}`
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1">Settings ⚙️</h1>
        <p className="text-slate-400">Customize your KidCode experience</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-kid">
              {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">{profile?.displayName ?? 'Demo Coder'}</h3>
              <p className="text-sm text-slate-400">{profile ? `Age ${profile.age} · ${profile.ageGroup} group` : 'Demo mode — no account'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Username', value: profile?.username ?? '—' },
              { label: 'Role', value: profile?.role ?? 'student' },
            ].map(f => (
              <div key={f.label} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">{f.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            {dark ? <Moon size={18} className="text-kc-purple-400" /> : <Sun size={18} className="text-kc-yellow-500" />}
            Appearance
          </h3>
          <div className="flex gap-3">
            {[
              { label: '☀️ Light', value: false },
              { label: '🌙 Dark', value: true },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => { setDark(opt.value); applyDarkMode(opt.value) }}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${dark === opt.value ? 'bg-kc-purple-500 text-white shadow-kid' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* GitHub */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h3 className="font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Github size={18} /> GitHub Integration
          </h3>
          <p className="text-sm text-slate-400 mb-4">Connect GitHub to save your projects and build a coding portfolio!</p>
          {githubConnecting ? (
            <div className="flex items-center gap-3 bg-kc-blue-50 dark:bg-kc-blue-900/20 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-full bg-kc-blue-400 flex items-center justify-center text-white text-sm font-black animate-pulse">⟳</div>
              <p className="font-bold text-kc-blue-700 dark:text-kc-blue-300 text-sm">Connecting GitHub…</p>
            </div>
          ) : profile?.githubUsername ? (
            <div className="flex items-center gap-3 bg-kc-green-50 dark:bg-kc-green-900/20 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-full bg-kc-green-500 flex items-center justify-center text-white text-sm font-black">✓</div>
              <div>
                <p className="font-bold text-kc-green-700 dark:text-kc-green-300 text-sm">Connected as @{profile.githubUsername}</p>
                <p className="text-xs text-kc-green-600 dark:text-kc-green-400">You can push projects to GitHub!</p>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={connectGitHub} className="w-full flex items-center gap-2">
              <Github size={16} /> Connect GitHub Account
            </Button>
          )}
        </Card>
      </motion.div>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Button variant="ghost" onClick={handleLogout} className="w-full flex items-center gap-2 text-slate-500 hover:text-red-500">
          <LogOut size={16} /> Sign Out
        </Button>
      </motion.div>
    </div>
  )
}
