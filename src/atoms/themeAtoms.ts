import { atomWithStorage } from 'jotai/utils'

export const darkModeAtom = atomWithStorage<boolean>(
  'kc-dark-mode',
  window.matchMedia('(prefers-color-scheme: dark)').matches,
)

// Apply dark class to <html> whenever atom changes
export const applyDarkMode = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark)
}
