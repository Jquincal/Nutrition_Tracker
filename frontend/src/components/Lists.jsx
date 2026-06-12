import { Dumbbell, Utensils } from 'lucide-react'

export function MealList({ items = [] }) {
  if (!items.length) return <Empty icon={Utensils} text="Todavía no registraste comidas." />
  return <div className="item-list">{items.map((x) => <div className="item" key={x.id}><span className="item-icon"><Utensils size={18} /></span><span><strong>{x.food_name}</strong><small>{x.quantity} {x.unit} · {Math.round(x.protein)}g proteína</small></span><b>{Math.round(x.calories)} kcal</b></div>)}</div>
}
export function WorkoutList({ items = [] }) {
  if (!items.length) return <Empty icon={Dumbbell} text="Todavía no registraste entrenamientos." />
  return <div className="item-list">{items.map((x) => <div className="item" key={x.id}><span className="item-icon orange"><Dumbbell size={18} /></span><span><strong>{x.name}</strong><small>{x.sets?.length || 0} series · {[...new Set(x.sets?.map((set) => set.exercise_name))].join(', ')}</small></span><b>{Math.round(x.calories_burned || 0)} kcal</b></div>)}</div>
}
function Empty({ icon: Icon, text }) { return <div className="empty"><Icon /><span>{text}</span></div> }
