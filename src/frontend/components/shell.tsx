import { ChevronDown, HelpCircle, LogOut, Menu, MessageCircle, MoreHorizontal, Search, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { roleNav } from '../data'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Role } from '../types'
import { Avatar, Badge, IconButton, cn } from './ui'

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={cn('brand', compact && 'brand-compact')}><span className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="12" fill="currentColor" /><path d="M12 18h5v-5h6v5h5v6h-5v5h-6v-5h-5z" fill="white" /><path d="M6 22h7l2-4 3 8 3-5 2 3h10" fill="none" stroke="#22C7D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{!compact && <span className="brand-word">MEDI<span>DESK</span></span>}</div>
}

const roleLabels: Record<Role, string> = { patient: 'Patient care workspace', doctor: 'Clinician workspace', admin: 'Hospital operations workspace' }

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const items = roleNav[user.role]
  const sections = [...new Set(items.map((item) => item.section))]
  return <>
    <div className={cn('sidebar-overlay', open && 'sidebar-overlay-open')} onClick={onClose} />
    <aside className={cn('sidebar', open && 'sidebar-open')} aria-label="Primary navigation">
      <div className="sidebar-brand"><Logo /><IconButton label="Close navigation" className="sidebar-close" onClick={onClose}><X size={18} /></IconButton></div>
      <div className="workspace-chip"><span className="pulse-dot" />{roleLabels[user.role]}<ChevronDown size={14} /></div>
      <nav className="sidebar-nav">
        {sections.map((section) => <div className="nav-section" key={section}><span className="nav-section-label">{section}</span>{items.filter((item) => item.section === section).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.label === 'Notifications' && <span className="nav-count">2</span>}</NavLink> })}</div>)}
      </nav>
      <div className="sidebar-footer"><div className="support-card"><div className="support-icon"><HelpCircle size={17} /></div><div><strong>Need clinical support?</strong><span>Open support desk</span></div><MoreHorizontal size={16} /></div><button className="logout-link" onClick={() => { logout(); navigate('/login') }}><LogOut size={17} /> Log out</button></div>
    </aside>
  </>
}

const pageLabels: Record<string, string> = {
  dashboard: 'Overview', doctors: 'Find doctors', appointments: 'Appointments', 'book-appointment': 'Book appointment', 'medical-records': 'Medical records', prescriptions: 'Prescriptions', 'lab-reports': 'Lab reports', messages: 'Messages', health: 'Health overview', notifications: 'Notifications', settings: 'Settings', patients: 'My patients', 'available-timings': 'Available timings', reviews: 'Reviews', earnings: 'Earnings', staff: 'Staff management', hospital: 'Hospital management', departments: 'Departments', beds: 'Bed management', revenue: 'Revenue', analytics: 'Analytics', reports: 'Reports',
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, switchRole } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  if (!user) return null
  const segments = location.pathname.split('/').filter(Boolean)
  const label = pageLabels[segments[segments.length - 1]] ?? 'Workspace'
  const roles: Role[] = ['patient', 'doctor', 'admin']
  const handleRole = (role: Role) => { switchRole(role); setProfileOpen(false); navigate(`/${role}/dashboard`); push('Care workspace switched', `Now viewing the ${role} demo care workspace.`, 'info') }
  return <header className="topbar"><div className="topbar-left"><IconButton label="Open navigation" className="menu-btn" onClick={onMenu}><Menu size={20} /></IconButton><div><div className="crumbs"><span>MEDIDESK</span><span>/</span><strong>{label}</strong></div><h1>{label}</h1></div></div><div className="topbar-actions"><label className="global-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && query.trim()) { navigate(`/${user.role}/doctors`); push('Search opened', `Showing results for “${query.trim()}”.`, 'info') } }} placeholder="Search anything" aria-label="Global search" /><kbd>⌘ K</kbd></label><IconButton label="Messages" onClick={() => navigate(`/${user.role}/messages`)}><MessageCircle size={19} /><span className="header-dot" /></IconButton><IconButton label="Notifications" onClick={() => navigate(`/${user.role}/notifications`)}><span className="bell-icon">●</span><span className="header-dot" /></IconButton><div className="profile-anchor"><button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)}><Avatar src={user.avatar} name={user.name} size="sm" online /><span className="profile-copy"><strong>{user.name}</strong><small>{user.title}</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-top"><Avatar src={user.avatar} name={user.name} size="md" /><div><strong>{user.name}</strong><span>{user.email}</span></div></div><div className="profile-menu-section"><span className="menu-label">Switch demo workspace</span>{roles.map((role) => <button key={role} className={cn('role-switch', user.role === role && 'role-switch-active')} onClick={() => handleRole(role)}><span className={`role-avatar role-${role}`}>{role.charAt(0).toUpperCase()}</span><span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>{user.role === role && <span className="role-check">✓</span>}</button>)}</div><button className="profile-menu-link" onClick={() => push('Profile ready', 'Profile editing is available from Settings.', 'info')}>My profile</button><button className="profile-menu-link" onClick={() => navigate(`/${user.role}/settings`)}>Settings</button><button className="profile-menu-link" onClick={() => push('Clinical support desk', 'A care coordinator will be available shortly.', 'info')}>Help center</button><button className="profile-menu-link profile-logout" onClick={() => { setProfileOpen(false); navigate('/login') }}>Log out</button></div>}</div></div></header>
}

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="app-frame"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="app-main"><Header onMenu={() => setSidebarOpen(true)} /><main className="page-content">{children}</main></div></div>
}
