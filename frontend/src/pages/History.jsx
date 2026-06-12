import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import MacroCard from '../components/MacroCard'
import { MealList, WorkoutList } from '../components/Lists'
import { today, useDay } from '../hooks/useData'
import { useApi } from '../api/client'
import { PageTitle } from './LogMeal'

function WeightTracker() {
  const api = useApi(), qc = useQueryClient()
  const [form, setForm] = useState({ id: null, value_kg: '', date: today() })
  const logs = useQuery({ queryKey: ['weight-logs'], queryFn: () => api('/weight-logs') })
  const weekly = useQuery({ queryKey: ['weight-weekly'], queryFn: () => api('/weight-logs/weekly') })
  const save = useMutation({
    mutationFn: () => api(form.id ? `/weight-logs/${form.id}` : '/weight-logs', { method: form.id ? 'PUT' : 'POST', body: JSON.stringify({ value_kg: form.value_kg, logged_at: new Date(`${form.date}T12:00:00`).toISOString() }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight-logs'] }); qc.invalidateQueries({ queryKey: ['weight-weekly'] }); setForm({ id: null, value_kg: '', date: today() }); toast.success('Peso registrado') },
    onError: (error) => toast.error(error.message),
  })
  const remove = useMutation({ mutationFn: (id) => api(`/weight-logs/${id}`, { method: 'DELETE' }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight-logs'] }); qc.invalidateQueries({ queryKey: ['weight-weekly'] }) } })
  const ordered = [...(logs.data || [])].reverse()
  const current = ordered.at(-1), previous = ordered.at(-2)
  const variation = current && previous ? Number(current.value_kg) - Number(previous.value_kg) : 0
  const weeklyCurrent = weekly.data?.at(-1)
  return <section className="weight-section"><div className="weight-metrics"><article className="panel"><span className="eyebrow">Peso actual</span><strong>{current ? `${Number(current.value_kg).toFixed(1)} kg` : 'Sin datos'}</strong></article><article className="panel"><span className="eyebrow">Variación</span><strong>{variation > 0 ? '+' : ''}{variation.toFixed(1)} kg</strong></article><article className="panel"><span className="eyebrow">Promedio semanal</span><strong>{weeklyCurrent ? `${Number(weeklyCurrent.average_kg).toFixed(1)} kg` : 'Sin datos'}</strong></article></div>
    <div className="two-col"><article className="panel"><div className="panel-title"><div><span className="eyebrow">Progreso</span><h2>Evolución de peso</h2></div></div><div className="weight-chart"><ResponsiveContainer width="100%" height={240}><LineChart data={ordered}><XAxis dataKey="logged_at" tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} /><YAxis domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Peso']} labelFormatter={(date) => new Date(date).toLocaleDateString()} /><Line type="monotone" dataKey="value_kg" stroke="var(--chart-protein)" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></article>
      <article className="panel"><span className="eyebrow">{form.id ? 'Editar registro' : 'Nuevo registro'}</span><div className="form-grid compact"><label>Peso (kg)<input type="number" step="0.1" value={form.value_kg} onChange={(e) => setForm({ ...form, value_kg: e.target.value })} /></label><label>Fecha<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label></div><button className="primary full" disabled={!form.value_kg || save.isPending} onClick={() => save.mutate()}>{form.id ? 'Actualizar peso' : 'Registrar peso'}</button><div className="weight-log-list">{logs.data?.slice(0, 4).map((log) => <div key={log.id}><span><strong>{Number(log.value_kg).toFixed(1)} kg</strong><small>{new Date(log.logged_at).toLocaleDateString()}</small></span><button aria-label="Editar peso" onClick={() => setForm({ id: log.id, value_kg: log.value_kg, date: String(log.logged_at).slice(0, 10) })}><Pencil size={15} /></button><button aria-label="Eliminar peso" onClick={() => remove.mutate(log.id)}><Trash2 size={15} /></button></div>)}</div></article></div>
  </section>
}

export default function History() {
  const [date, setDate] = useState(today()), { summary, meals, workouts } = useDay(date)
  const totals = summary.data?.totals || {}, goals = summary.data?.goals || {}
  return <><div className="page-head"><PageTitle eyebrow="Historial" title="Medí tu progreso." text="Revisá nutrición, sesiones y evolución corporal." /><label className="date-picker">Fecha<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div><WeightTracker /><section className="macro-grid"><MacroCard label="Proteína" value={totals.protein} goal={goals.protein_goal} unit="g" color="#2e7d50" /><MacroCard label="Calorías" value={totals.calories} goal={goals.calories_goal} unit="kcal" color="#e87d37" /></section><section className="two-col"><article className="panel"><h2>Comidas</h2><MealList items={meals.data} /></article><article className="panel"><h2>Sesiones</h2><WorkoutList items={workouts.data} /></article></section></>
}
