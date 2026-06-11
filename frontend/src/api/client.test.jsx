import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ApiProvider, useApi } from './client'

function Probe() {
  const api = useApi()
  useQuery({ queryKey: ['probe'], queryFn: () => api('/probe') })
  return null
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('retries Clerk token retrieval before making an authenticated request', async () => {
  const getToken = vi.fn().mockResolvedValueOnce(null).mockResolvedValue('token')
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(<QueryClientProvider client={queryClient}><ApiProvider getToken={getToken}><Probe /></ApiProvider></QueryClientProvider>)

  await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token')
})
