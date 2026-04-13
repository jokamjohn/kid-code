import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/Button'
import { getAgeGroup } from '@/lib/utils/age'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, age: Number(age) } },
    })
    if (error) { setError(error.message); setLoading(false); return }

    // Seed the profile row via the API (auth guard uses the new session)
    if (signUpData.session) {
      try {
        await apiClient.post('/api/profile/init', { displayName: name, age: Number(age) })
      } catch {
        // Non-fatal — profile can be retried on next login
      }
    }

    navigate('/dashboard')
    setLoading(false)
  }

  const ageNum = Number(age)
  const ageGroup = ageNum >= 6 ? getAgeGroup(ageNum) : null
  const ageLabel = ageGroup === 'young' ? '🌱 Explorer (6–9)' : ageGroup === 'middle' ? '🔨 Builder (10–12)' : ageGroup === 'older' ? '🚀 Creator (13–14)' : null

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
          <h1 className="text-3xl font-black text-slate-800">Create your account 🚀</h1>
          <p className="text-slate-400 mt-1">Start your coding journey today — it's free!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                placeholder="Alex the Coder" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Age</label>
              <div className="flex gap-3">
                <input type="number" value={age} onChange={e => setAge(e.target.value)} min={6} max={18} required
                  className="w-24 rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                  placeholder="10" />
                {ageLabel && <div className="flex-1 flex items-center bg-kc-purple-50 rounded-2xl px-4 text-sm font-bold text-kc-purple-700">{ageLabel}</div>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required
                className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
                placeholder="At least 8 characters" />
            </div>
            {error && <p className="text-red-500 text-sm font-bold bg-red-50 rounded-xl px-4 py-2">{error}</p>}
            <Button type="submit" size="lg" loading={loading} className="w-full">Create Account 🎉</Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-kc-purple-600 font-bold hover:underline">Log in</Link>
          </p>
          <p className="text-center text-xs text-slate-300 mt-3">
            By signing up, you agree to our Terms of Service.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
