import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'

export const today = () => new Date().toISOString().slice(0, 10)

export function useDay(date = today()) {
  const api = useApi()
  const summary = useQuery({ queryKey: ['summary', date], queryFn: () => api(`/analytics/today?date=${date}`) })
  const meals = useQuery({ queryKey: ['meals', date], queryFn: () => api(`/meals?date=${date}`) })
  const workouts = useQuery({ queryKey: ['workouts', date], queryFn: () => api(`/workouts?date=${date}`) })
  return { summary, meals, workouts }
}

export function useWeek() {
  const api = useApi()
  return useQuery({ queryKey: ['week'], queryFn: () => api('/analytics/week') })
}

export function useCreate(path, message, keys) {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api(path, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { keys.forEach((key) => qc.invalidateQueries({ queryKey: [key] })); toast.success(message) },
    onError: (error) => toast.error(error.message),
  })
}
