import { useAtom } from 'jotai'
import { useRef, useEffect, useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Terminal } from 'lucide-react'
import { playgroundFilesAtom, activeFileNameAtom, consoleLogsAtom, isRunningAtom } from '@/atoms/playgroundAtoms'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

const LANG_COLOR: Record<string, string> = {
  html: 'text-kc-coral-600 bg-kc-coral-50',
  css: 'text-kc-blue-600 bg-kc-blue-50',
  javascript: 'text-kc-green-600 bg-kc-green-50',
}

export default function Playground() {
  const [files, setFiles] = useAtom(playgroundFilesAtom)
  const [activeName, setActiveName] = useAtom(activeFileNameAtom)
  const [logs, setLogs] = useAtom(consoleLogsAtom)
  const [running, setRunning] = useAtom(isRunningAtom)
  const [showConsole, setShowConsole] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const activeFile = files.find(f => f.name === activeName) ?? files[0]

  function updateFile(content: string) {
    setFiles(prev => prev.map(f => f.name === activeName ? { ...f, content } : f))
  }

  function runCode() {
    setRunning(true)
    setLogs([])
    const html = files.find(f => f.language === 'html')?.content ?? ''
    const css = files.find(f => f.language === 'css')?.content ?? ''
    const js = files.find(f => f.language === 'javascript')?.content ?? ''

    const consoleCapture = `
      <script>
        const _logs = [];
        const _origLog = console.log;
        console.log = (...args) => {
          _origLog(...args);
          window.parent.postMessage({ type: 'console', data: args.map(String).join(' ') }, '*');
        };
        window.onerror = (msg) => window.parent.postMessage({ type: 'console', data: '❌ ' + msg }, '*');
      </script>`

    const srcdoc = html
      .replace('</head>', `<style>${css}</style>${consoleCapture}</head>`)
      .replace('</body>', `<script>${js}</script></body>`)

    if (iframeRef.current) {
      iframeRef.current.srcdoc = srcdoc
    }
    setTimeout(() => setRunning(false), 500)
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'console') setLogs(prev => [...prev, e.data.data])
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setLogs])

  function reset() {
    setFiles(prev => prev.map(f => f.name === activeName ? { ...f, content: '' } : f))
    setLogs([])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <span className="font-black text-slate-700 dark:text-white text-sm">🎮 Playground</span>
        <div className="flex items-center gap-1 ml-2">
          {files.map(f => (
            <button
              key={f.name}
              onClick={() => setActiveName(f.name)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                activeName === f.name
                  ? LANG_COLOR[f.language]
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={reset} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Reset file">
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setShowConsole(v => !v)}
            className={cn('p-2 rounded-xl transition-colors', showConsole ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400')}
            title="Toggle console"
          >
            <Terminal size={15} />
          </button>
          <Button size="sm" onClick={runCode} loading={running} className="gap-2">
            <Play size={14} /> Run
          </Button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 text-sm font-mono">
              Loading editor... ⚡
            </div>
          }>
            <MonacoEditor
              height="100%"
              language={activeFile?.language ?? 'html'}
              value={activeFile?.content ?? ''}
              onChange={v => v !== undefined && updateFile(v)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
              }}
            />
          </Suspense>
        </div>

        {/* Right: Preview + Console */}
        <div className="w-[45%] flex flex-col border-l border-slate-200 dark:border-slate-800">
          <div className="flex-1 bg-white relative overflow-hidden">
            <div className="absolute top-2 left-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center gap-2 z-10">
              <div className="flex gap-1">
                {['bg-red-400','bg-yellow-400','bg-green-400'].map(c=><div key={c} className={cn('w-2.5 h-2.5 rounded-full', c)} />)}
              </div>
              <span className="text-xs text-slate-400 font-mono flex-1 text-center">preview</span>
            </div>
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts"
              className="w-full h-full border-0 mt-8"
              title="Live Preview"
              srcDoc={`<!DOCTYPE html><html><body><div style="padding:20px;font-family:sans-serif;color:#94a3b8;text-align:center;margin-top:80px"><div style="font-size:48px;margin-bottom:12px">▶️</div><p style="font-weight:700">Click Run to see your code!</p></div></body></html>`}
            />
          </div>

          {/* Console */}
          {showConsole && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 160 }}
              className="border-t border-slate-200 dark:border-slate-700 bg-slate-900 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Terminal size={11} /> Console</span>
                <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
                {logs.length === 0
                  ? <p className="text-slate-600">// console output appears here</p>
                  : logs.map((l, i) => <p key={i} className="text-kc-green-400">{l}</p>)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
