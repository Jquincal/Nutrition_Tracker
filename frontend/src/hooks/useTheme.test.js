import { beforeEach, expect, test, vi } from 'vitest'
import { applyTheme, getStoredTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
})

test('persists and applies a selected theme', () => {
  applyTheme('dark')

  expect(getStoredTheme()).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(document.documentElement.style.colorScheme).toBe('dark')
})
