import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { healthSeries, appointmentFlow, revenueSeries } from '../data'
import { Card } from './ui'

const axis = { fontSize: 11, fill: '#8A9BAA' }
const tooltipStyle = { border: '1px solid #DDE8F0', borderRadius: 12, boxShadow: '0 10px 30px rgba(18,48,74,0.08)', background: '#fff' }

export function HealthTrendChart({ metric = 'heart', height = 220 }: { metric?: 'heart' | 'systolic' | 'glucose' | 'weight'; height?: number }) {
  const key = metric === 'heart' ? 'heart' : metric === 'systolic' ? 'systolic' : metric === 'glucose' ? 'glucose' : 'weight'
  const color = metric === 'heart' ? '#1677FF' : metric === 'systolic' ? '#7C5CFC' : metric === 'glucose' ? '#E78D3A' : '#19A66A'
  return <ResponsiveContainer width="100%" height={height}><LineChart data={healthSeries} margin={{ top: 10, right: 4, bottom: 0, left: -24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} /><Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#DDE8F0' }} /><Line type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 3, fill: '#fff', stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>
}

export function RevenueAreaChart({ height = 258 }: { height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={revenueSeries} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1677FF" stopOpacity={0.2} /><stop offset="100%" stopColor="#1677FF" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} tickFormatter={(value) => `$${value}k`} /><Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value}k`, 'Revenue']} /><Area type="monotone" dataKey="revenue" stroke="#1677FF" strokeWidth={3} fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer>
}

export function AppointmentFlowChart({ height = 268 }: { height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><BarChart data={appointmentFlow} margin={{ top: 12, right: 8, bottom: 0, left: -22 }} barGap={5}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F6" /><XAxis dataKey="department" axisLine={false} tickLine={false} tick={axis} /><YAxis axisLine={false} tickLine={false} tick={axis} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="upcoming" fill="#1677FF" radius={[5, 5, 0, 0]} /><Bar dataKey="completed" fill="#22C7D6" radius={[5, 5, 0, 0]} /><Bar dataKey="cancelled" fill="#F3B15C" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
}

export function OccupancyChart() {
  const data = [{ name: 'General', value: 48, color: '#1677FF' }, { name: 'ICU', value: 28, color: '#7C5CFC' }, { name: 'Emergency', value: 24, color: '#22C7D6' }]
  return <div className="occupancy-wrap"><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius="68%" outerRadius="92%" paddingAngle={4} dataKey="value" stroke="none">{data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>78%</strong><span>occupied</span></div></div><div className="legend-list">{data.map((item) => <div key={item.name}><span className="legend-dot" style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}%</strong></div>)}</div></div>
}

export function MiniSparkline({ color = '#1677FF' }: { color?: string }) {
  return <ResponsiveContainer width="100%" height={42}><LineChart data={revenueSeries}><Line type="monotone" dataKey="revenue" stroke={color} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
}

export function ChartCard({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <Card className="chart-card"><div className="chart-head"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{action}</div>{children}</Card>
}
