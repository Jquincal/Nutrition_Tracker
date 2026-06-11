import { expect, test } from 'vitest'
import { formatWeekData } from './weeklyChartData'

test('formats weekly calories and protein as numbers', () => {
  expect(formatWeekData([{ date: '2026-06-11', calories: '450.50', protein: '32.20' }])[0]).toMatchObject({
    calories: 450.5,
    protein: 32.2,
  })
})
