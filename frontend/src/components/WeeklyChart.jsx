import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function WeeklyChart({ data = [], goal = 150 }) {
  const formatted = data.map((d) => ({ ...d, day: new Date(d.date).toLocaleDateString('es', { weekday: 'short' }), protein: Number(d.protein), goal: Number(goal) }))
  return <div className="chart" aria-label="Proteína consumida durante los últimos siete días"><ResponsiveContainer width="100%" height={240}><BarChart data={formatted}><CartesianGrid vertical={false} stroke="#e5e7eb" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Bar dataKey="goal" fill="#e8eee9" radius={[7, 7, 0, 0]} /><Bar dataKey="protein" fill="#2e7d50" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>
}
