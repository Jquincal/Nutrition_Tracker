import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'
import { useTheme } from '../hooks/useTheme'
import { PageTitle } from './LogMeal'

export default function Settings() {
  const api = useApi(), qc = useQueryClient(), user = useQuery({ queryKey: ['user'], queryFn: () => api('/users/me') })
  const [changes, setChanges] = useState({})
  const { theme, updateTheme } = useTheme()
  const form = { ...user.data, ...changes }
  const save = useMutation({ mutationFn: () => api('/users/me', { method: 'PUT', body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries(); toast.success('Objetivos actualizados') }, onError: (e) => toast.error(e.message) })
  return <><PageTitle eyebrow="Preferencias" title="Ajustá tus objetivos." text="Personalizá tus metas y la apariencia de NutriFlow." />
    <section className="settings-grid">
      <article className="panel form-panel"><div className="panel-title"><div><span className="eyebrow">Nutrición</span><h2>Objetivos diarios</h2></div></div><p className="muted">El peso corporal se usa para calcular calorías de cardio.</p><div className="form-grid">{[['protein_goal','Proteína diaria (g)'],['calories_goal','Calorías diarias'],['carbs_goal','Carbohidratos (g)'],['fats_goal','Grasas (g)'],['weight_kg','Peso corporal (kg)']].map(([key,label]) => <label key={key}>{label}<input type="number" value={form[key] || ''} onChange={(e) => setChanges({ ...changes, [key]: e.target.value })} /></label>)}</div><button className="primary full" onClick={() => save.mutate()} disabled={save.isPending} aria-busy={save.isPending}>{save.isPending ? 'Guardando...' : 'Guardar cambios'}</button></article>
      <article className="panel theme-panel"><span className="eyebrow">Apariencia</span><h2>Tema de la aplicación</h2><p className="muted">Elegí cómo querés ver NutriFlow en este dispositivo.</p><div className="theme-options" role="group" aria-label="Tema de la aplicación"><button className={theme === 'light' ? 'active' : ''} aria-pressed={theme === 'light'} onClick={() => updateTheme('light')}><Sun /><span><strong>Claro</strong><small>Fondos claros y alto contraste.</small></span></button><button className={theme === 'dark' ? 'active' : ''} aria-pressed={theme === 'dark'} onClick={() => updateTheme('dark')}><Moon /><span><strong>Oscuro</strong><small>Menor brillo para ambientes oscuros.</small></span></button></div></article>
    </section>
  </>
}
