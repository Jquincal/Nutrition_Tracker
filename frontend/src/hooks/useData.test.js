import { describe, expect, test } from 'vitest'
import { today } from './useData'

describe('today', () => {
  test('formats the browser local date instead of using UTC', () => {
    const localDate = {
      getFullYear: () => 2026,
      getMonth: () => 5,
      getDate: () => 11,
    }

    expect(today(localDate)).toBe('2026-06-11')
  })
})
