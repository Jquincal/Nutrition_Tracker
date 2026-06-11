import { Dumbbell, Utensils } from 'lucide-react'

export function MealList({ items = [] }) {
  if (!items.length) return <Empty icon={Utensils} text="Todavía no registraste comidas." />
  return <div className="item-list">{items.map((x) => <div className="item" key={x.id}><span className="item-icon"><Utensils size={18} /></span><span><strong>{x.food_name}</strong><small>{x.quantity} {x.unit} · {Math.round(x.protein)}g proteína</small></span><b>{Math.round(x.calories)} kcal</b></div>)}</div>
}
export function WorkoutList({ items = [] }) {
  if (!items.length) return <Empty icon={Dumbbell} text="Todavía no registraste entrenamientos." />
  return <div className="item-list">{items.map((x) => <div className="item" key={x.id}><span className="item-icon orange"><Dumbbell size={18} /></span><span><strong>{x.exercise_name}</strong><small>{x.exercise_type === 'fuerza' ? `${x.sets} × ${x.reps} · ${x.weight || 0} kg` : `${x.duration_minutes} minutos`}</small></span><b>{Math.round(x.calories_burned)} kcal</b></div>)}</div>
}
function Empty({ icon: Icon, text }) { return <div className="empty"><Icon /><span>{text}</span></div> }
