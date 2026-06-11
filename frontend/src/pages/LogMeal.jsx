import { useEffect, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useApi } from '../api/client'
import { useCreate } from '../hooks/useData'

const blank = { name: '', protein: 0, calories: 0, carbs: 0, fats: 0, serving_size: 100 }
export default function LogMeal() {
  const api = useApi(), [term, setTerm] = useState(''), [debounced, setDebounced] = useState(''), [food, setFood] = useState(null), [quantity, setQuantity] = useState(100), [manual, setManual] = useState(blank)
  useEffect(() => { const id = setTimeout(() => setDebounced(term), 400); return () => clearTimeout(id) }, [term])
  const search = useQuery({ queryKey: ['food-search', debounced], queryFn: () => api(`/meals/search?q=${encodeURIComponent(debounced)}`), enabled: debounced.length > 1 })
  const createMeal = useCreate('/meals', 'Comida agregada', ['meals', 'summary', 'week'])
  const createManualMeal = useCreate('/meals/manual', 'Alimento guardado y comida agregada', ['food-search', 'meals', 'summary', 'week'])
  const factor = quantity / Number(food?.serving_size || 100)
  const add = () => createMeal.mutate({ food_name: food.name, usda_id: food.usda_id, quantity, unit: 'g', protein: Number(food.protein) * factor, calories: Number(food.calories) * factor, carbs: Number(food.carbs) * factor, fats: Number(food.fats) * factor }, { onSuccess: () => setFood(null) })
  const addManual = () => createManualMeal.mutate(manual, { onSuccess: () => setManual(blank) })
  return <><PageTitle eyebrow="Registro de comidas" title="¿Qué comiste?" text="Buscá USDA o tus alimentos personalizados." /><section className="two-col form-layout"><article className="panel"><label>Buscar alimento<div className="search"><Search size={19} /><input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ej. pollo, arroz, whey..." /></div></label><div className="search-results">{search.data?.map((x, i) => <button key={`${x.source}-${x.id || x.usda_id}-${i}`} onClick={() => setFood(x)}><span><strong>{x.name}</strong><small>{x.source} · por {x.serving_size || 100}g</small></span><b>{Math.round(x.calories)} kcal</b></button>)}</div>{food && <div className="selection"><span className="eyebrow">Seleccionado</span><h2>{food.name}</h2><label>Cantidad (g)<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><div className="macro-pills"><span>{Math.round(food.protein * factor)}g proteína</span><span>{Math.round(food.carbs * factor)}g carbs</span><span>{Math.round(food.fats * factor)}g grasas</span></div><button className="primary" onClick={add} disabled={createMeal.isPending} aria-busy={createMeal.isPending}>{createMeal.isPending ? 'Agregando...' : `Agregar · ${Math.round(food.calories * factor)} kcal`}</button></div>}</article>
    <article className="panel"><div className="panel-title"><div><span className="eyebrow">No está en la lista</span><h2>Crear alimento manual</h2></div><Sparkles /></div><p className="muted">Ingresá macros por porción. Lo guardaremos y lo agregaremos a las comidas de hoy.</p><div className="form-grid"><label className="wide">Nombre<input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} /></label>{['serving_size','calories','protein','carbs','fats'].map((key) => <label key={key}>{key.replace('_', ' ')}<input type="number" value={manual[key]} onChange={(e) => setManual({ ...manual, [key]: e.target.value })} /></label>)}</div><button className="secondary full" onClick={addManual} disabled={!manual.name.trim() || createManualMeal.isPending} aria-busy={createManualMeal.isPending}>{createManualMeal.isPending ? 'Guardando y agregando...' : 'Guardar y agregar comida'}</button></article></section></>
}
function PageTitle({ eyebrow, title, text }) { return <header className="page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></header> }
export { PageTitle }
