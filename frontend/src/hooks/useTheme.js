import { useState } from 'react'

const storageKey = 'nutriflow-theme'
const validThemes = ['light', 'dark']

export const getStoredTheme = () => {
  const stored = localStorage.getItem(storageKey)
  if (validThemes.includes(stored)) return stored
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyTheme = (theme) => {
  const nextTheme = validThemes.includes(theme) ? theme : getStoredTheme()
  document.documentElement.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme
  localStorage.setItem(storageKey, nextTheme)
  return nextTheme
}

export function useTheme() {
  const [theme, setTheme] = useState(getStoredTheme)
  const updateTheme = (nextTheme) => setTheme(applyTheme(nextTheme))
  return { theme, updateTheme }
}
