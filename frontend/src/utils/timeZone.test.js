import { describe, expect, test } from 'vitest'
import { normalizeTimeZone } from './timeZone'

describe('normalizeTimeZone', () => {
  test('uses PostgreSQL-compatible names for browser aliases', () => {
    expect(normalizeTimeZone('America/Mendoza')).toBe('America/Argentina/Mendoza')
    expect(normalizeTimeZone('America/Buenos_Aires')).toBe('America/Argentina/Buenos_Aires')
  })

  test('preserves supported zones and falls back to UTC', () => {
    expect(normalizeTimeZone('Europe/Madrid')).toBe('Europe/Madrid')
    expect(normalizeTimeZone()).toBe('UTC')
  })
})
