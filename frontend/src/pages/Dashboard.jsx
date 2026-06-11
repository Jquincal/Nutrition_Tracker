import { Link } from 'react-router-dom'
import { Flame, Plus, TrendingUp } from 'lucide-react'
import MacroCard from '../components/MacroCard'
import WeeklyChart from '../components/WeeklyChart'
import { MealList, WorkoutList } from '../components/Lists'
import { useDay, useWeek } from '../hooks/useData'

export default function Dashboard() {
  const { summary, meals, workouts } = useDay()
  const week = useWeek()
  const totals = summary.data?.totals || {}, goals = summary.data?.goals || {}
  return <><header className="page-head"><div><span className="eyebrow">Resumen diario</span><h1>Hoy es un buen día para avanzar.</h1><p>Registrá lo que comés y mirá cómo se mueve tu progreso.</p></div><div className="actions"><Link className="button secondary" to="/workout"><Plus size={18} /> Entreno</Link><Link className="button primary" to="/meal"><Plus size={18} /> Comida</Link></div></header>
    <section className="macro-grid"><MacroCard label="Proteína" value={totals.protein} goal={goals.protein_goal} unit="g" color="#2e7d50" /><MacroCard label="Calorías" value={totals.calories} goal={goals.calories_goal} unit="kcal" color="#e87d37" /><MacroCard label="Carbohidratos" value={totals.carbs} goal={goals.carbs_goal} unit="g" color="#4f76c7" /><MacroCard label="Grasas" value={totals.fats} goal={goals.fats_goal} unit="g" color="#8a62b6" /></section>
    <section className="two-col"><article className="panel"><div className="panel-title"><div><span className="eyebrow">Últimos 7 días</span><h2>Calorías y proteína consumidas</h2></div><TrendingUp /></div><WeeklyChart data={week.data} proteinGoal={goals.protein_goal} /></article><article className="panel accent-panel"><Flame /><span className="eyebrow">Balance de hoy</span><strong>{Math.round(Number(totals.calories || 0) - Number(summary.data?.activity?.calories_burned || 0))}</strong><p>kcal netas</p><small>Consumidas menos actividad registrada.</small></article></section>
    <section className="two-col"><article className="panel"><div className="panel-title"><h2>Comidas de hoy</h2><Link to="/meal">Agregar</Link></div><MealList items={meals.data} /></article><article className="panel"><div className="panel-title"><h2>Entrenamientos</h2><Link to="/workout">Agregar</Link></div><WorkoutList items={workouts.data} /></article></section></>
}
