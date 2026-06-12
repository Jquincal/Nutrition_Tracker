import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'
import { useTheme } from '../hooks/useTheme'
import { PageTitle } from './LogMeal'

const activityLevels = [
  ['sedentary', 'Sedentario'],
  ['light', 'Actividad ligera'],
  ['moderate', 'Actividad moderada'],
  ['active', 'Activo'],
  ['very_active', 'Muy activo'],
]

export default function Settings() {
  const api = useApi(), qc = useQueryClient(), user = useQuery({ queryKey: ['user'], queryFn: () => api('/users/me') })
  const [changes, setChanges] = useState({})
  const { theme, updateTheme } = useTheme()
  const form = { ...user.data, ...changes }
  const change = (key, value) => setChanges((current) => ({ ...current, [key]: value }))
  const save = useMutation({
    mutationFn: () => api('/users/me', { method: 'PUT', body: JSON.stringify(form) }),
    onSuccess: (data) => { qc.setQueryData(['user'], data); qc.invalidateQueries({ queryKey: ['summary'] }); setChanges({}); toast.success('Perfil y objetivos actualizados') },
    onError: (e) => toast.error(e.message),
  })
  return <><PageTitle eyebrow="Preferencias" title="Tu perfil, tus objetivos." text="Completá tu perfil corporal para calcular automáticamente tu gasto energético diario." />
    <section className="settings-grid">
      <article className="panel form-panel"><div className="panel-title"><div><span className="eyebrow">Perfil corporal</span><h2>Cálculo de TDEE</h2></div>{form.tdee_goal && <span className="metric-badge"><strong>{Math.round(form.tdee_goal)}</strong> kcal/día</span>}</div><p className="muted">Al completar sexo biológico, altura, edad, peso y actividad, el TDEE actualizará tu meta calórica.</p>
        <div className="form-grid">
          <label>Sexo biológico<select value={form.sex || ''} onChange={(e) => change('sex', e.target.value || null)}><option value="">Seleccionar</option><option value="female">Femenino</option><option value="male">Masculino</option></select></label>
          <label>Nivel de actividad<select value={form.activity_level || ''} onChange={(e) => change('activity_level', e.target.value || null)}><option value="">Seleccionar</option>{activityLevels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {[['height_cm','Altura (cm)'],['age','Edad'],['weight_kg','Peso corporal (kg)'],['protein_goal','Proteína diaria (g)'],['carbs_goal','Carbohidratos (g)'],['fats_goal','Grasas (g)']].map(([key,label]) => <label key={key}>{label}<input type="number" value={form[key] || ''} onChange={(e) => change(key, e.target.value)} /></label>)}
        </div><button className="primary full" onClick={() => save.mutate()} disabled={save.isPending} aria-busy={save.isPending}>{save.isPending ? 'Calculando...' : 'Guardar y calcular TDEE'}</button>
      </article>
      <article className="panel theme-panel"><span className="eyebrow">Apariencia</span><h2>Tema de la aplicación</h2><p className="muted">Elegí cómo querés ver FitStack Pro en este dispositivo.</p><div className="theme-options" role="group" aria-label="Tema de la aplicación"><button className={theme === 'light' ? 'active' : ''} aria-pressed={theme === 'light'} onClick={() => updateTheme('light')}><Sun /><span><strong>Claro</strong><small>Fondos claros y alto contraste.</small></span></button><button className={theme === 'dark' ? 'active' : ''} aria-pressed={theme === 'dark'} onClick={() => updateTheme('dark')}><Moon /><span><strong>Oscuro</strong><small>Menor brillo para ambientes oscuros.</small></span></button></div></article>
    </section>
  </>
}
