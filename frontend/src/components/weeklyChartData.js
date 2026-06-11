export const formatWeekData = (data = []) => data.map((item) => {
  const date = String(item.date).slice(0, 10)
  return {
    ...item,
    day: new Date(`${date}T12:00:00`).toLocaleDateString('es', { weekday: 'short' }),
    protein: Number(item.protein || 0),
    calories: Number(item.calories || 0),
  }
})
