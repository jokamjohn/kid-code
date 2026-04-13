import { atom } from 'jotai'

export interface PlaygroundFile {
  name: string
  language: 'html' | 'css' | 'javascript'
  content: string
}

const DEFAULT_FILES: PlaygroundFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Hello, KidCode! 🎉</h1>
    <p>Start coding here!</p>
    <script src="script.js"></script>
  </body>
</html>`,
  },
  { name: 'style.css', language: 'css', content: `body {\n  font-family: sans-serif;\n  background: #f0f9ff;\n  padding: 20px;\n}\n\nh1 {\n  color: #7c3aed;\n}` },
  { name: 'script.js', language: 'javascript', content: `// Write JavaScript here!\nconsole.log('Ready to code!')` },
]

export const playgroundFilesAtom = atom<PlaygroundFile[]>(DEFAULT_FILES)
export const activeFileNameAtom = atom('index.html')
export const playgroundOutputAtom = atom('')
export const consoleLogsAtom = atom<string[]>([])
export const isRunningAtom = atom(false)
