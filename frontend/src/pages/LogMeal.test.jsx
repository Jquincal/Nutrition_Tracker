import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ApiProvider } from '../api/client'
import LogMeal from './LogMeal'

afterEach(() => {
  vi.restoreAllMocks()
})

test('saving a manual food also registers it as a meal', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ food: {}, meal: {} }),
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider getToken={async () => null}>
        <LogMeal />
      </ApiProvider>
    </QueryClientProvider>,
  )

  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Pollo manual' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y agregar comida' }))

  await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
  expect(fetch.mock.calls[0][0]).toBe('http://localhost:3001/api/meals/manual')
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ name: 'Pollo manual', serving_size: 100 })
})
