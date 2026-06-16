import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
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

  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

  render(<MemoryRouter initialEntries={['/workout']}><QueryClientProvider client={queryClient}><ApiProvider getToken={async () => null} requireToken={false}><LogWorkout /></ApiProvider></QueryClientProvider></MemoryRouter>)

  fireEvent.click(await screen.findByRole('button', { name: /Push-up/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Duplicar serie' }))
  fireEvent.click(screen.getByRole('button', { name: 'Guardar sesión' }))

  await waitFor(() => expect(fetch.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true))
  const post = fetch.mock.calls.find(([, options]) => options?.method === 'POST')
  const body = JSON.parse(post[1].body)
  expect(body.sets).toHaveLength(2)
  expect(body.sets[0]).not.toHaveProperty('calories_burned')
  expect(screen.queryByText('kcal')).toBeNull()
  await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['workouts'], refetchType: 'all' }))
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['summary'], refetchType: 'all' })
})

test('creates a private manual exercise and adds it to the session', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options = {}) => ({
    ok: true,
    status: options.method === 'POST' ? 201 : 200,
    json: async () => options.method === 'POST' && url.endsWith('/exercises')
      ? { id: 8, name: 'Press especial', type: 'strength', provider: 'manual' }
      : [],
  }))
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(<MemoryRouter><QueryClientProvider client={queryClient}><ApiProvider getToken={async () => null} requireToken={false}><LogWorkout /></ApiProvider></QueryClientProvider></MemoryRouter>)

  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Press especial' } })
  fireEvent.change(screen.getByLabelText('Equipo o máquina'), { target: { value: 'Polea' } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear y agregar a la sesión' }))

  await screen.findByText('Press especial')
  const post = fetch.mock.calls.find(([url, options]) => url.endsWith('/exercises') && options?.method === 'POST')
  expect(JSON.parse(post[1].body)).toMatchObject({ name: 'Press especial', type: 'strength', equipment: 'Polea' })
})
