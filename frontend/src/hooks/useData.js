import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApi } from '../api/client'

export const today = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const dayQuery = (date) => new URLSearchParams({ date, tz: timeZone })

export function useDay(date = today()) {
  const api = useApi()
  const params = dayQuery(date)
  const summary = useQuery({ queryKey: ['summary', date, timeZone], queryFn: () => api(`/analytics/today?${params}`) })
  const meals = useQuery({ queryKey: ['meals', date, timeZone], queryFn: () => api(`/meals?${params}`) })
  const workouts = useQuery({ queryKey: ['workouts', date, timeZone], queryFn: () => api(`/workouts?${params}`) })
  return { summary, meals, workouts }
}

export function useWeek() {
  const api = useApi()
  return useQuery({
    queryKey: ['week', timeZone],
    queryFn: () => api(`/analytics/week?${new URLSearchParams({ tz: timeZone })}`),
    staleTime: 0,
    refetchOnMount: 'always',
  })
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
