import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SUBJECTS = [
  { id: 'computing', emoji: '💻', title: 'Computing', desc: 'How computers work, binary, and algorithms', color: 'from-kc-yellow-400 to-kc-yellow-500', bg: 'bg-kc-yellow-50', border: 'border-kc-yellow-200' },
  { id: 'html', emoji: '🏷️', title: 'HTML', desc: 'Build the skeleton of every webpage', color: 'from-kc-coral-400 to-kc-coral-500', bg: 'bg-kc-coral-50', border: 'border-kc-coral-200' },
  { id: 'css', emoji: '🎨', title: 'CSS', desc: 'Style pages with colors, layouts & animations', color: 'from-kc-blue-400 to-kc-blue-500', bg: 'bg-kc-blue-50', border: 'border-kc-blue-200' },
  { id: 'javascript', emoji: '⚡', title: 'JavaScript', desc: 'Make pages interactive and alive', color: 'from-kc-green-400 to-kc-green-500', bg: 'bg-kc-green-50', border: 'border-kc-green-200' },
]

const FEATURES = [
  { emoji: '🤖', title: 'AI Tutor', desc: 'Ask Spark anything — your personal coding buddy answers in plain language, just for you.', color: 'kc-purple' },
  { emoji: '💻', title: 'Live Playground', desc: 'Write code and see it come to life instantly. No setup, no fuss — just code and create!', color: 'kc-blue' },
  { emoji: '🐙', title: 'GitHub Integration', desc: 'Save your projects to GitHub with a single click. Build a real coding portfolio!', color: 'kc-green' },
]

const FLOATIES = [
  { emoji: '🌟', top: '8%', left: '5%', delay: 0 },
  { emoji: '⭐', top: '15%', right: '8%', delay: 0.5 },
  { emoji: '🚀', top: '60%', left: '2%', delay: 1 },
  { emoji: '💡', top: '75%', right: '5%', delay: 0.3 },
  { emoji: '🎮', top: '40%', right: '3%', delay: 0.8 },
  { emoji: '🔥', top: '30%', left: '3%', delay: 1.2 },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kc-purple-50 via-white to-slate-50 overflow-x-hidden font-sans relative">
      {/* Floating emojis */}
      {FLOATIES.map((f, i) => (
        <motion.div
          key={i}
          className="fixed text-3xl pointer-events-none select-none z-0 hidden lg:block"
          style={{ top: f.top, left: (f as any).left, right: (f as any).right }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center shadow-kid">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-black text-xl text-slate-800">KidCode</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        variants={container} initial="hidden" animate="show"
        className="relative z-10 text-center px-6 pt-12 pb-20 max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-kc-purple-100 text-kc-purple-700 rounded-full px-4 py-2 text-sm font-bold mb-6">
          <Star size={14} className="fill-kc-purple-500 text-kc-purple-500" />
          Free for kids ages 6–14 · Powered by AI
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-6">
          Learn to Code —{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-kc-purple-500 via-kc-blue-500 to-kc-green-500 bg-clip-text text-transparent">
              It's Fun!
            </span>
            <motion.span
              className="absolute -top-4 -right-6 text-3xl"
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >🎉</motion.span>
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-xl text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Explore Computing, HTML, CSS & JavaScript with interactive lessons, a live code playground, and an AI buddy who's always there to help.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto group">
              Start Learning 🚀
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/learn">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Lessons
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-slate-100">
          {[['16', 'lessons'], ['4', 'subjects'], ['AI', 'tutor'], ['∞', 'fun']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-black text-kc-purple-600">{n}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{l}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Subjects */}
      <section className="relative z-10 px-6 md:px-16 pb-20 max-w-6xl mx-auto">
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {SUBJECTS.map((s) => (
            <motion.div key={s.id} variants={fadeUp}>
              <Link to={`/learn/${s.id}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`${s.bg} border-2 ${s.border} rounded-3xl p-6 text-center cursor-pointer group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} mx-auto mb-4 flex items-center justify-center text-3xl shadow-md group-hover:shadow-lg transition-shadow`}>
                    {s.emoji}
                  </div>
                  <h3 className="font-black text-lg text-slate-800 mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why KidCode */}
      <section className="relative z-10 px-6 md:px-16 pb-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800 mb-3">Why KidCode? ✨</h2>
          <p className="text-center text-slate-400 mb-10">Everything a young coder needs — in one place.</p>
        </motion.div>

        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <div className="bg-white rounded-3xl p-7 shadow-card border border-slate-100 text-center h-full">
                <div className="text-5xl mb-4">{f.emoji}</div>
                <h3 className="font-black text-xl text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-r from-kc-purple-500 to-kc-blue-500 rounded-3xl p-10 text-center text-white shadow-kid"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-black mb-3">Ready to start your coding adventure?</h2>
          <p className="text-kc-purple-100 mb-8">Join thousands of kids learning to code — for free!</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-kc-purple-700 hover:bg-kc-purple-50 shadow-none font-black">
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-black text-slate-700">KidCode</span>
        </div>
        <p className="text-sm text-slate-400">Making coding accessible and fun for every kid. 🌍</p>
      </footer>
    </div>
  )
}
