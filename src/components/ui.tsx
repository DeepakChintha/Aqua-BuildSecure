import { Check, ChevronDown, FileWarning, Info, Loader2, Search, X } from 'lucide-react'
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import type { StatMetric, Status } from '../types'

export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(' ') }

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'; size?: 'sm' | 'md' | 'lg' }) {
  return <button className={cn('btn', `btn-${variant}`, `btn-${size}`, className)} {...props}>{children}</button>
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className={cn('icon-btn', className)} aria-label={label} {...props}>{children}</button>
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props}>{children}</div>
}

export function Badge({ tone = 'neutral', children }: { tone?: 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'purple' | 'neutral'; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ status }: { status: Status | string }) {
  const value = status.toLowerCase()
  const tone = value.includes('cancel') || value.includes('maintenance') ? 'red' : value.includes('pending') || value.includes('reserved') ? 'orange' : value.includes('complete') || value.includes('available') || value.includes('confirmed') || value.includes('ready') || value.includes('reviewed') ? 'green' : 'blue'
  return <Badge tone={tone}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

export function Avatar({ src, name, size = 'md', online = false }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; online?: boolean }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()
  return <span className={cn('avatar-wrap', `avatar-${size}`)}>
    {src && !failed ? <img src={src} alt={`${name} avatar`} onError={() => setFailed(true)} /> : <span className="avatar-fallback">{initials}</span>}
    {online && <span className="online-dot" aria-label="Online" />}
  </span>
}

export function StatCard({ metric }: { metric: StatMetric }) {
  const Icon = metric.icon
  return <Card className="stat-card">
    <div className="stat-topline"><span className={`stat-icon stat-icon-${metric.tone}`}><Icon size={18} /></span><span className="stat-kicker">{metric.label}</span><button className="more-dots" aria-label={`More actions for ${metric.label}`}>•••</button></div>
    <div className="stat-value">{metric.value}</div>
    <div className="stat-detail"><span className={`stat-change change-${metric.tone}`}>{metric.change}</span><span>{metric.detail}</span></div>
  </Card>
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
}

export function SearchInput({ value, onChange, placeholder = 'Search', className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return <label className={cn('search-input', className)}><Search size={17} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /><kbd>⌘ K</kbd></label>
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (value: string) => void }) {
  return <div className="tabs" role="tablist">{items.map((item) => <button key={item} role="tab" aria-selected={active === item} className={active === item ? 'tab-active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><FileWarning size={22} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function LoadingState({ label = 'Loading your workspace' }: { label?: string }) {
  return <div className="loading-state"><Loader2 className="spin" size={22} /><span>{label}</span></div>
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="error-state"><Info size={20} /><div><strong>Unable to load data</strong><p>Something went wrong. Please try again.</p></div>{onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>}</div>
}

export function Skeleton({ className }: { className?: string }) { return <div className={cn('skeleton', className)} /> }

export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2 id="modal-title">{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></div><div className="modal-body">{children}</div>{footer && <div className="modal-footer">{footer}</div>}</div></div>
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="field"><span>{label}</span><span className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span></label>
}

export function InputField({ label, required, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; hint?: string; error?: string }) {
  return <label className="field"><span>{label}{required && <em> *</em>}</span><input {...props} aria-invalid={Boolean(error)} />{hint && !error && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>
}

export function ConfirmationIcon() { return <span className="confirmation-icon"><Check size={22} /></span> }
