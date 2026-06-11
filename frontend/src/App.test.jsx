import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

test('renders app without crashing', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <App demo={true} />
    </QueryClientProvider>
  )
  expect(screen.getAllByText(/NutriFlow/i)).not.toHaveLength(0)
  const mobileNav = screen.getByRole('navigation', { name: 'Navegación móvil' })
  expect(within(mobileNav).getByText('Ajustes')).toBeDefined()
  expect(within(mobileNav).getByText('Cuenta')).toBeDefined()
})
