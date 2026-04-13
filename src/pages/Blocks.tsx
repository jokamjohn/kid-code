import { useState } from 'react'
import { motion } from 'framer-motion'
import { DndContext, closestCenter, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Play, RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { Link } from 'react-router-dom'

interface Block {
  id: string
  type: 'print' | 'loop' | 'if' | 'variable' | 'wait'
  label: string
  emoji: string
  color: string
  code: (params?: string) => string
  params?: string
}

const PALETTE: Block[] = [
  { id: 'print', type: 'print', label: 'Say', emoji: '💬', color: 'bg-kc-purple-100 border-kc-purple-300 text-kc-purple-800', code: (p = 'Hello!') => `console.log("${p}");`, params: 'Hello!' },
  { id: 'loop', type: 'loop', label: 'Repeat', emoji: '🔄', color: 'bg-kc-blue-100 border-kc-blue-300 text-kc-blue-800', code: (p = '5') => `for (let i = 0; i < ${p}; i++) {\n  // repeat\n}`, params: '5' },
  { id: 'if', type: 'if', label: 'If...Then', emoji: '❓', color: 'bg-kc-yellow-100 border-kc-yellow-300 text-kc-yellow-800', code: (p = 'true') => `if (${p}) {\n  // then\n}`, params: 'true' },
  { id: 'variable', type: 'variable', label: 'Set Variable', emoji: '📦', color: 'bg-kc-coral-100 border-kc-coral-300 text-kc-coral-800', code: (p = 'myVar = 10') => `let ${p};`, params: 'myVar = 10' },
  { id: 'wait', type: 'wait', label: 'Wait', emoji: '⏳', color: 'bg-kc-green-100 border-kc-green-300 text-kc-green-800', code: (p = '1000') => `await new Promise(r => setTimeout(r, ${p}));`, params: '1000' },
]

let idCounter = 100
function makeBlock(template: Block): Block & { id: string } {
  return { ...template, id: `b${idCounter++}`, params: template.params }
}

function PaletteBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette-${block.id}`, data: { fromPalette: true, block } })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={cn('flex items-center gap-2 px-4 py-3 rounded-2xl border-2 cursor-grab active:cursor-grabbing select-none font-bold text-sm transition-all', block.color, isDragging && 'opacity-40 scale-95')}>
      <span className="text-lg">{block.emoji}</span>
      {block.label}
    </div>
  )
}

function CanvasBlock({ block, onRemove, onParamChange }: { block: Block & { id: string }, onRemove: () => void, onParamChange: (v: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-sm', block.color)}>
      <span className="text-lg">{block.emoji}</span>
      <span>{block.label}</span>
      {block.params !== undefined && (
        <input value={block.params} onChange={e => onParamChange(e.target.value)}
          className="ml-1 bg-white/60 rounded-lg border border-current/20 px-2 py-1 text-xs font-bold w-24 outline-none" />
      )}
      <button onClick={onRemove} className="ml-auto text-current/40 hover:text-red-500 font-black text-lg leading-none">×</button>
    </motion.div>
  )
}

function DropZone({ children, isEmpty }: { children: React.ReactNode, isEmpty: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas' })
  return (
    <div ref={setNodeRef} className={cn('flex-1 rounded-3xl border-2 border-dashed p-4 space-y-2 min-h-64 transition-colors', isOver ? 'border-kc-purple-400 bg-kc-purple-50 dark:bg-kc-purple-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900')}>
      {isEmpty && <div className="flex flex-col items-center justify-center h-40 text-slate-300 dark:text-slate-600 select-none"><div className="text-5xl mb-3">🧩</div><p className="font-bold text-sm">Drag blocks here to build your program!</p></div>}
      {children}
    </div>
  )
}

export default function Blocks() {
  const [canvasBlocks, setCanvasBlocks] = useState<(Block & { id: string })[]>([])
  const [output, setOutput] = useState<string[]>([])
  const [ran, setRan] = useState(false)

  function handleDragEnd(e: DragEndEvent) {
    if (e.over?.id === 'canvas' && e.active.data.current?.fromPalette) {
      const tpl = e.active.data.current.block as Block
      setCanvasBlocks(prev => [...prev, makeBlock(tpl)])
    }
  }

  function removeBlock(id: string) { setCanvasBlocks(prev => prev.filter(b => b.id !== id)) }
  function updateParam(id: string, v: string) { setCanvasBlocks(prev => prev.map(b => b.id === id ? { ...b, params: v } : b)) }

  function runProgram() {
    const lines: string[] = []
    const origLog = console.log
    console.log = (...args) => { lines.push(args.map(String).join(' ')); origLog(...args) }
    try {
      // Safe simulation for print blocks only
      const printLines = canvasBlocks.filter(b => b.type === 'print').map(b => `💬 ${b.params ?? 'Hello!'}`)
      const loopLines = canvasBlocks.filter(b => b.type === 'loop').flatMap(b => {
        const n = parseInt(b.params ?? '5')
        return Array.from({ length: Math.min(n, 10) }, (_, i) => `🔄 Loop run ${i + 1}`)
      })
      setOutput([...printLines, ...loopLines, canvasBlocks.length > 0 ? '✅ Program finished!' : ''])
    } catch {
      setOutput(['❌ Oops! Something went wrong.'])
    }
    console.log = origLog
    setRan(true)
  }

  const generatedCode = canvasBlocks.map(b => b.code(b.params)).join('\n')

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1">🧩 Block Editor</h1>
        <p className="text-slate-400">Drag blocks to build a program — see the code it generates!</p>
      </motion.div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-[220px_1fr_1fr] gap-5 h-[500px]">
          {/* Palette */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Blocks</p>
            {PALETTE.map(b => <PaletteBlock key={b.id} block={b} />)}
          </div>

          {/* Canvas */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your Program</p>
              <div className="flex gap-2">
                <button onClick={() => { setCanvasBlocks([]); setOutput([]); setRan(false) }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><RotateCcw size={14} /></button>
                <Button size="sm" onClick={runProgram} disabled={canvasBlocks.length === 0}><Play size={13} /> Run</Button>
              </div>
            </div>
            <DropZone isEmpty={canvasBlocks.length === 0}>
              {canvasBlocks.map(b => <CanvasBlock key={b.id} block={b} onRemove={() => removeBlock(b.id)} onParamChange={v => updateParam(b.id, v)} />)}
            </DropZone>
            {ran && output.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono space-y-1">
                {output.map((l, i) => <div key={i} className="text-kc-green-400">{l}</div>)}
              </div>
            )}
          </div>

          {/* Generated Code */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generated Code</p>
              <Link to="/playground">
                <button className="flex items-center gap-1 text-xs font-bold text-kc-blue-500 hover:underline"><ArrowRight size={12} /> Open in Playground</button>
              </Link>
            </div>
            <pre className="flex-1 bg-slate-900 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-auto">
              {generatedCode || <span className="text-slate-600">// Drag blocks to see code appear here!</span>}
            </pre>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
