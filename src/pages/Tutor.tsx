import { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw } from 'lucide-react'
import { chatMessagesAtom, tutorLoadingAtom } from '@/atoms/tutorAtoms'
import { mascotMoodAtom } from '@/atoms/mascotAtoms'
import { profileAtom } from '@/atoms/userAtoms'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

const SUGGESTED = [
  'What is HTML?',
  'How do I center something in CSS?',
  'What is a variable?',
  'What is a loop?',
  'How does the internet work?',
  'What is binary?',
]

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3030'

export default function Tutor() {
  const [messages, setMessages] = useAtom(chatMessagesAtom)
  const [loading, setLoading] = useAtom(tutorLoadingAtom)
  const [profile] = useAtom(profileAtom)
  const [, setMood] = useAtom(mascotMoodAtom)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setMood('thinking')

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() }])

    try {
      const res = await fetch(`${API_BASE}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, context: { ageGroup: profile?.ageGroup ?? 'middle' } }),
      })

      if (!res.ok || !res.body) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) {
                full += data.text
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m))
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch {
      // Demo mode fallback
      const demos: Record<string, string> = {
        'What is HTML?': "Great question! 🌟 **HTML** stands for **HyperText Markup Language**. Think of it as the skeleton of a webpage — it tells the browser what content to show, like headings, paragraphs, images, and links!\n\nEvery webpage you've ever visited is built with HTML. It uses special codes called **tags** that look like `<this>`. Cool, right?",
        'How do I center something in CSS?': "Centering things in CSS is super useful! 🎨 Here's the easiest way:\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n```\n\nThis uses **Flexbox** — it's like magic for layouts! Try it in the Playground!",
        'What is a variable?': "A **variable** is like a labeled box where you store information! 📦\n\n```javascript\nlet name = 'Alex'\nlet age = 10\nlet isCool = true\n```\n\nYou can put words (strings), numbers, or true/false (booleans) in your boxes. Then use them anywhere in your code!",
      }
      const fallback = demos[text] ?? `That's a wonderful question about "${text}"! 🤔\n\nI'm currently in demo mode (the API server isn't connected yet), but once it's running, I'll give you a full answer. For now, try exploring the lessons in the **Learn** section — they cover lots of great topics!`

      let typed = ''
      for (const char of fallback) {
        typed += char
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: typed } : m))
        await new Promise(r => setTimeout(r, 12))
      }
    }

    setLoading(false)
    setMood('happy')
    setTimeout(() => setMood('idle'), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🤖</span> AI Tutor — Spark
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Ask me anything about coding!</p>
        </div>
        <button onClick={() => setMessages([])} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Clear chat">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-7xl mb-4 animate-float">🤖</div>
            <h2 className="font-black text-xl text-slate-700 dark:text-slate-200 mb-2">Hi! I'm Spark! ✨</h2>
            <p className="text-slate-400 text-sm mb-8">I'm your personal coding tutor. Ask me anything!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="bg-kc-purple-50 dark:bg-kc-purple-900/30 text-kc-purple-700 dark:text-kc-purple-300 text-sm font-bold px-4 py-2 rounded-full hover:bg-kc-purple-100 dark:hover:bg-kc-purple-900/50 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg',
                msg.role === 'assistant' ? 'bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 shadow-kid' : 'bg-kc-blue-100'
              )}>
                {msg.role === 'assistant' ? '🤖' : '😊'}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed font-medium',
                msg.role === 'user'
                  ? 'bg-kc-purple-500 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-card'
              )}>
                {msg.content ? (
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                ) : (
                  <div className="flex gap-1.5 items-center py-1">
                    {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-slate-300" animate={{ y: [0,-6,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 p-2 shadow-card">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask Spark anything about coding..."
          className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
        />
        <Button onClick={() => sendMessage(input)} loading={loading} disabled={!input.trim()} size="sm" className="flex-shrink-0">
          <Send size={15} />
        </Button>
      </div>

      {/* Suggested chips when chatting */}
      {messages.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {SUGGESTED.slice(0, 3).map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="flex-shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-kc-purple-300 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
