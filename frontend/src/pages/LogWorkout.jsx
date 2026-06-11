import { useState } from 'react'
import { useCreate } from '../hooks/useData'
import { PageTitle } from './LogMeal'

export default function LogWorkout() {
  const [type, setType] = useState('cardio'), [form, setForm] = useState({ exercise_name: 'Caminar', duration_minutes: 30, sets: 4, reps: 10, weight: 20, notes: '' })
  const create = useCreate('/workouts', 'Entrenamiento guardado', ['workouts', 'summary'])
  const field = (key, label, type = 'number') => <label>{label}<input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
  return <><PageTitle eyebrow="Registro de actividad" title="Sumá tu entrenamiento." text="Calculamos calorías aproximadas según tu peso y la duración o volumen." /><article className="panel form-panel"><div className="segmented"><button className={type === 'cardio' ? 'active' : ''} onClick={() => setType('cardio')}>Cardio</button><button className={type === 'fuerza' ? 'active' : ''} onClick={() => setType('fuerza')}>Fuerza</button></div><div className="form-grid">{field('exercise_name', 'Ejercicio', 'text')}{field('duration_minutes', 'Duración (min)')}{type === 'fuerza' && <>{field('sets', 'Series')}{field('reps', 'Repeticiones')}{field('weight', 'Peso (kg)')}</>}{field('notes', 'Notas', 'text')}</div><button className="primary full" onClick={() => create.mutate({ ...form, exercise_type: type })}>Guardar entrenamiento</button></article></>
}
