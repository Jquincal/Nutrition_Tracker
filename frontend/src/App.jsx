import { useEffect } from 'react'
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/react'
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Activity, ChartNoAxesColumnIncreasing, Dumbbell, LayoutDashboard, Settings as SettingsIcon, Utensils } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import LogMeal from './pages/LogMeal'
import LogWorkout from './pages/LogWorkout'
import History from './pages/History'
import Settings from './pages/Settings'
import { ApiProvider, useApi } from './api/client'
import './App.css'

const nav = [
  ['/', 'Hoy', LayoutDashboard],
  ['/meal', 'Comida', Utensils],
  ['/workout', 'Entreno', Dumbbell],
  ['/history', 'Historial', ChartNoAxesColumnIncreasing],
  ['/settings', 'Ajustes', SettingsIcon],
]

function Shell({ demo = false, user = null }) {
  const api = useApi()
  useEffect(() => {
    api('/users/sync', { method: 'POST', body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress || 'local@demo.dev', name: user?.fullName || 'Usuario local' }) }).catch(() => {})
  }, [api, user?.id, user?.fullName, user?.primaryEmailAddress?.emailAddress])

  return <BrowserRouter>
    <div className="app-shell">
      <header className="mobile-header">
        <div className="brand"><span className="brand-mark"><Activity size={22} /></span><span><strong>NutriFlow</strong></span></div>
        {!demo && <UserButton />}
      </header>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Activity size={22} /></span><span><strong>NutriFlow</strong><small>Nutrition tracker</small></span></div>
        <nav aria-label="Navegación principal">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
        <div className="profile">{demo ? <><span className="avatar">DL</span><span><strong>Demo local</strong><small>Sin Clerk</small></span></> : <><UserButton /><span><strong>{user?.firstName || 'Mi cuenta'}</strong><small>{user?.primaryEmailAddress?.emailAddress}</small></span></>}</div>
      </aside>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meal" element={<LogMeal />} />
          <Route path="/workout" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <nav className="bottom-nav" aria-label="Navegación móvil">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={21} /><span>{label}</span></NavLink>)}</nav>
    </div>
  </BrowserRouter>
}

function ClerkApp() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  if (!isLoaded) return <div className="auth-page"><div className="auth-card">Cargando...</div></div>
  if (!isSignedIn) return <div className="auth-page"><div className="auth-card"><span className="brand-mark large"><Activity /></span><h1>Tu nutrición, clara.</h1><p>Registrá comidas y entrenamientos. Medí el progreso que importa.</p><div className="auth-actions"><SignInButton mode="modal"><button className="secondary">Ingresar</button></SignInButton><SignUpButton mode="modal"><button className="primary">Crear cuenta</button></SignUpButton></div></div></div>
  return <ApiProvider getToken={getToken}><Shell user={user} /></ApiProvider>
}

export default function App({ demo = false }) {
  return <><Toaster position="top-right" />{demo ? <ApiProvider getToken={async () => null}><Shell demo /></ApiProvider> : <ClerkApp />}</>
}
