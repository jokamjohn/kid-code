import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Github, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import type { Project, ProjectType } from '@/types/project'

const TYPE_STYLES: Record<ProjectType, { bg: string, badge: string, text: string, emoji: string }> = {
  html:       { bg: 'bg-kc-coral-50 dark:bg-kc-coral-900/20',   badge: 'bg-kc-coral-100 text-kc-coral-700',  text: 'text-kc-coral-700',  emoji: '🏷️' },
  css:        { bg: 'bg-kc-blue-50 dark:bg-kc-blue-900/20',     badge: 'bg-kc-blue-100 text-kc-blue-700',    text: 'text-kc-blue-700',   emoji: '🎨' },
  javascript: { bg: 'bg-kc-green-50 dark:bg-kc-green-900/20',   badge: 'bg-kc-green-100 text-kc-green-700',  text: 'text-kc-green-700',  emoji: '⚡' },
  full:       { bg: 'bg-kc-purple-50 dark:bg-kc-purple-900/20', badge: 'bg-kc-purple-100 text-kc-purple-700',text: 'text-kc-purple-700', emoji: '🚀' },
  blocks:     { bg: 'bg-kc-yellow-50 dark:bg-kc-yellow-900/20', badge: 'bg-kc-yellow-100 text-kc-yellow-700',text: 'text-kc-yellow-700', emoji: '🧩' },
}

export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<ProjectType>('full')

  function createProject() {
    if (!newName.trim()) return
    const p: Project = {
      id: Date.now().toString(),
      userId: 'local',
      name: newName.trim(),
      type: newType,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [p, ...prev])
    setShowNew(false)
    setNewName('')
    navigate('/playground')
  }

  function deleteProject(id: string) {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">My Projects 📁</h1>
          <p className="text-slate-400 mt-1">Build, save, and share your creations</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Project
        </Button>
      </motion.div>

      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="text-center py-16">
            <div className="text-7xl mb-4">🚀</div>
            <h3 className="font-black text-xl text-slate-700 dark:text-white mb-2">No projects yet!</h3>
            <p className="text-slate-400 mb-6">Create your first project and start building something awesome.</p>
            <Button onClick={() => setShowNew(true)}>
              <Plus size={16} /> Create First Project
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {projects.map((p, i) => {
            const style = TYPE_STYLES[p.type]
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className={cn('rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 group cursor-pointer', style.bg)}
                  onClick={() => navigate('/playground')}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{style.emoji}</div>
                    <span className={cn('text-xs font-black rounded-full px-3 py-1', style.badge)}>{p.type}</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <Clock size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs">Open</Button>
                    {p.githubRepo
                      ? <button className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors" onClick={e => { e.stopPropagation() }}><Github size={14} /></button>
                      : null}
                    <button
                      onClick={e => { e.stopPropagation(); deleteProject(p.id) }}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* New Project Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Project 🚀" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1.5">Project Name</label>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createProject()}
              autoFocus placeholder="My Awesome Website"
              className="w-full rounded-2xl border-2 border-slate-100 focus:border-kc-purple-300 px-4 py-3 text-sm font-medium outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_STYLES) as ProjectType[]).map(t => (
                <button key={t} onClick={() => setNewType(t)}
                  className={cn('py-2 rounded-xl text-xs font-bold transition-all', newType === t ? 'bg-kc-purple-500 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100')}>
                  {TYPE_STYLES[t].emoji} {t}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={createProject} disabled={!newName.trim()} className="w-full" size="lg">
            Create Project
          </Button>
        </div>
      </Modal>
    </div>
  )
}
