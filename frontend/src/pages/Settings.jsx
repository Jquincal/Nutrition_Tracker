import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'
import { PageTitle } from './LogMeal'

export default function Settings() {
  const api = useApi(), qc = useQueryClient(), user = useQuery({ queryKey: ['user'], queryFn: () => api('/users/me') })
  const [changes, setChanges] = useState({})
  const form = { ...user.data, ...changes }
  const save = useMutation({ mutationFn: () => api('/users/me', { method: 'PUT', body: JSON.stringify(form) }), onSuccess: () => { qc.invalidateQueries(); toast.success('Objetivos actualizados') }, onError: (e) => toast.error(e.message) })
  return <><PageTitle eyebrow="Preferencias" title="Ajustá tus objetivos." text="El peso corporal se usa para calcular calorías de cardio." /><article className="panel form-panel"><div className="form-grid">{[['protein_goal','Proteína diaria (g)'],['calories_goal','Calorías diarias'],['carbs_goal','Carbohidratos (g)'],['fats_goal','Grasas (g)'],['weight_kg','Peso corporal (kg)']].map(([key,label]) => <label key={key}>{label}<input type="number" value={form[key] || ''} onChange={(e) => setChanges({ ...changes, [key]: e.target.value })} /></label>)}</div><button className="primary full" onClick={() => save.mutate()}>Guardar cambios</button></article></>
}
