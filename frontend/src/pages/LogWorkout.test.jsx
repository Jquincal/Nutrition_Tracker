import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ApiProvider } from '../api/client'
import LogWorkout from './LogWorkout'

afterEach(() => {
  vi.restoreAllMocks()
})

test('saves multiple sets as one workout session', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options = {}) => ({
    ok: true,
    status: options.method === 'POST' ? 201 : 200,
    json: async () => url.includes('/exercises')
      ? [{ id: 1, name: 'Push-up', type: 'strength', target_muscle: 'chest', equipment: 'body weight', instructions: [] }]
      : { id: 1 },
  }))
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(<QueryClientProvider client={queryClient}><ApiProvider getToken={async () => null} requireToken={false}><LogWorkout /></ApiProvider></QueryClientProvider>)

  fireEvent.click(await screen.findByRole('button', { name: /Push-up/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar serie' }))
  fireEvent.click(screen.getByRole('button', { name: 'Guardar sesión' }))

  await waitFor(() => expect(fetch.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true))
  const post = fetch.mock.calls.find(([, options]) => options?.method === 'POST')
  expect(JSON.parse(post[1].body).sets).toHaveLength(2)
})
