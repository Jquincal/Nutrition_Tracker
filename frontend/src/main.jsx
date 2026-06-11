import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const app = clerkKey ? <ClerkProvider publishableKey={clerkKey}><App /></ClerkProvider> : <App demo />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>{app}</QueryClientProvider>
  </StrictMode>,
)
