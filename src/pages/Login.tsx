import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  function demoLogin() {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kc-purple-50 to-white p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center shadow-kid">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-black text-xl text-slate-800">KidCode</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-800">Welcome back! 👋</h1>
          <p className="text-slate-400 mt-1">Log in to continue your coding journey</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-bold bg-red-50 rounded-xl px-4 py-2">{error}</p>}
            <Button type="submit" size="lg" loading={loading} className="w-full">Log In</Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-semibold">or</span></div>
          </div>

          <Button variant="secondary" size="lg" onClick={demoLogin} className="w-full">
            🎮 Try Demo (no account needed)
          </Button>

          <p className="text-center text-sm text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-kc-purple-600 font-bold hover:underline">Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
