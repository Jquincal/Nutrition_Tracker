import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'
import { useCreate } from '../hooks/useData'
import { PageTitle } from './LogMeal'

const emptySet = (exercise) => ({ exercise_id: exercise.id, exercise_name: exercise.name, exercise_type: exercise.type, weight_kg: '', reps: '', duration_minutes: '' })
const emptyManual = { name: '', type: 'strength', target_muscle: '', body_part: '', equipment: '', instructions: [] }

export default function LogWorkout() {
  const api = useApi(), qc = useQueryClient()
  const [search, setSearch] = useState(''), [muscle, setMuscle] = useState(''), [equipment, setEquipment] = useState('')
  const [form, setForm] = useState({ name: 'Entrenamiento', notes: '', sets: [] })
  const [manual, setManual] = useState(emptyManual)
  const params = useMemo(() => new URLSearchParams({ search, muscle, equipment }), [search, muscle, equipment])
  const exercises = useQuery({ queryKey: ['exercises', search, muscle, equipment], queryFn: () => api(`/exercises?${params}`) })
  const create = useCreate('/workouts', 'Sesión guardada', ['workouts', 'summary'])
  const createManual = useMutation({
    mutationFn: () => api('/exercises', { method: 'POST', body: JSON.stringify(manual) }),
    onSuccess: (exercise) => {
      qc.invalidateQueries({ queryKey: ['exercises'] })
      setForm((current) => ({ ...current, sets: [...current.sets, emptySet(exercise)] }))
      setManual(emptyManual)
      toast.success('Ejercicio personalizado creado y agregado')
    },
    onError: (error) => toast.error(error.message),
  })
  const updateSet = (index, key, value) => setForm((current) => ({ ...current, sets: current.sets.map((set, i) => i === index ? { ...set, [key]: value } : set) }))
  const addExercise = (exercise) => setForm((current) => ({ ...current, sets: [...current.sets, emptySet(exercise)] }))
  const addAnother = (index) => setForm((current) => ({ ...current, sets: [...current.sets.slice(0, index + 1), { ...current.sets[index] }, ...current.sets.slice(index + 1)] }))
  const remove = (index) => setForm((current) => ({ ...current, sets: current.sets.filter((_, i) => i !== index) }))
  const submit = () => create.mutate({ ...form, sets: form.sets.map((set, index) => ({
    exercise_id: set.exercise_id,
    weight_kg: set.weight_kg,
    reps: set.reps,
    duration_minutes: set.duration_minutes,
    set_order: index + 1,
  })) })

  return <><PageTitle eyebrow="Diario de entrenamiento" title="Armá una sesión completa." text="Buscá ejercicios o creá los tuyos. El gasto calórico se calcula automáticamente con tu peso, el tipo de ejercicio y su duración o series." />
    <section className="workout-builder">
      <div className="exercise-column">
        <article className="panel exercise-browser"><div className="search"><Search size={17} /><input aria-label="Buscar ejercicios" placeholder="Buscar: press banca, polea, piernas..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="filter-row"><input aria-label="Filtrar por músculo" placeholder="Músculo" value={muscle} onChange={(e) => setMuscle(e.target.value)} /><input aria-label="Filtrar por equipo" placeholder="Equipo o máquina" value={equipment} onChange={(e) => setEquipment(e.target.value)} /></div>
          <div className="exercise-results">{exercises.data?.map((exercise) => <div className="exercise-result" key={exercise.id}><button onClick={() => addExercise(exercise)}><span><strong>{exercise.name}</strong><small>{exercise.target_muscle || exercise.body_part} · {exercise.equipment || 'sin equipo'}{exercise.provider === 'manual' ? ' · personalizado' : ''}</small></span><Plus size={17} /></button>{(exercise.instructions?.length > 0 || exercise.gif_url) && <details><summary>Instructions & demo</summary>{exercise.gif_url && <img src={exercise.gif_url} alt={`Demonstration of ${exercise.name}`} loading="lazy" />}{exercise.instructions?.map((instruction, index) => <p key={index}>{index + 1}. {instruction}</p>)}</details>}</div>)}</div>
        </article>
        <article className="panel manual-exercise"><span className="eyebrow">Ejercicio personalizado</span><h2>Cargar ejercicio manualmente</h2><p className="muted">Quedará guardado únicamente en tu cuenta y aparecerá primero en las búsquedas.</p><div className="form-grid compact"><label>Nombre<input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} /></label><label>Tipo<select value={manual.type} onChange={(e) => setManual({ ...manual, type: e.target.value })}><option value="strength">Fuerza</option><option value="cardio">Cardio</option></select></label><label>Músculo principal<input value={manual.target_muscle} onChange={(e) => setManual({ ...manual, target_muscle: e.target.value })} /></label><label>Equipo o máquina<input value={manual.equipment} onChange={(e) => setManual({ ...manual, equipment: e.target.value })} /></label></div><button className="secondary full" disabled={manual.name.trim().length < 2 || createManual.isPending} onClick={() => createManual.mutate()}>{createManual.isPending ? 'Creando...' : 'Crear y agregar a la sesión'}</button></article>
      </div>
      <article className="panel session-panel"><div className="form-grid compact"><label>Nombre de sesión<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Notas<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label></div>
        <p className="calorie-note">Las calorías quemadas se calculan automáticamente al guardar según tu peso actual y la duración de cada ejercicio.</p>
        {!form.sets.length && <div className="empty-session">Agregá un ejercicio para comenzar.</div>}
        <div className="set-list">{form.sets.map((set, index) => <div className="set-row" key={`${set.exercise_id}-${index}`}><div className="set-heading"><span><strong>{set.exercise_name}</strong><small>Serie {index + 1} · {set.exercise_type === 'cardio' ? 'cardio' : 'fuerza'}</small></span><div><button aria-label="Duplicar serie" onClick={() => addAnother(index)}><Plus size={16} /></button><button aria-label="Eliminar serie" onClick={() => remove(index)}><Trash2 size={16} /></button></div></div><div className="set-fields"><label>Minutos<input type="number" value={set.duration_minutes} onChange={(e) => updateSet(index, 'duration_minutes', e.target.value)} /></label><label>kg<input type="number" value={set.weight_kg} onChange={(e) => updateSet(index, 'weight_kg', e.target.value)} /></label><label>Reps<input type="number" value={set.reps} onChange={(e) => updateSet(index, 'reps', e.target.value)} /></label></div></div>)}</div>
        <button className="primary full" disabled={!form.sets.length || create.isPending} onClick={submit}>{create.isPending ? 'Calculando y guardando...' : 'Guardar sesión'}</button>
      </article>
    </section>
  </>
}
