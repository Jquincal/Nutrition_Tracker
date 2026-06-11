import { useState } from 'react'
import MacroCard from '../components/MacroCard'
import { MealList, WorkoutList } from '../components/Lists'
import { today, useDay } from '../hooks/useData'
import { PageTitle } from './LogMeal'

export default function History() {
  const [date, setDate] = useState(today()), { summary, meals, workouts } = useDay(date)
  const totals = summary.data?.totals || {}, goals = summary.data?.goals || {}
  return <><div className="page-head"><PageTitle eyebrow="Historial" title="Revisá cualquier día." text="Las fechas visitadas quedan en caché para navegar más rápido." /><label className="date-picker">Fecha<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div><section className="macro-grid"><MacroCard label="Proteína" value={totals.protein} goal={goals.protein_goal} unit="g" color="#2e7d50" /><MacroCard label="Calorías" value={totals.calories} goal={goals.calories_goal} unit="kcal" color="#e87d37" /></section><section className="two-col"><article className="panel"><h2>Comidas</h2><MealList items={meals.data} /></article><article className="panel"><h2>Entrenamientos</h2><WorkoutList items={workouts.data} /></article></section></>
}
