import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Logo } from '../components/shell'
import { Button, Card, InputField, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Role } from '../types'

const roleCopy: Record<Role, { label: string; description: string; color: string }> = {
  patient: { label: 'Patient', description: 'Track visits, records, and care pathways.', color: '#087F8C' },
  doctor: { label: 'Clinician', description: 'Manage visits and clinical teams.', color: '#6570B8' },
  admin: { label: 'Hospital admin', description: 'Operate the hospital with confidence.', color: '#198C62' },
}

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <div className="auth-page"><div className="auth-brand-panel"><Logo /><div className="auth-story"><div className="story-pulse"><Sparkles size={16} /><span>Clinical care, connected.</span></div><h1>One clear view of every clinical moment.</h1><p>MEDIDESK helps patients, clinicians, and hospital operators move from health information to confident action.</p><div className="story-metrics"><div><strong>98%</strong><span>clinical team adoption</span></div><div><strong>24/7</strong><span>care coordination</span></div></div></div><div className="auth-panel-note"><ShieldCheck size={16} /> Built for secure, thoughtful healthcare workflows.</div></div><div className="auth-form-panel"><div className="auth-form-wrap"><div className="auth-eyebrow">{eyebrow}</div><h2>{title}</h2><p className="auth-description">{description}</p>{children}<p className="auth-legal">By continuing, you agree to MEDIDESK’s Terms and Privacy Policy.</p></div></div></div>
}

export function LoginPage() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role>('patient')
  const [email, setEmail] = useState('aarav@medidesk.demo')
  const [password, setPassword] = useState('demo-password')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: string } | null)?.from

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    if (password.length < 6) { setError('Use at least 6 characters for the demo password.'); return }
    setError('')
    setLoading(true)

    try {
      await login(email, password)

      push(
        'You’re signed in',
        'Opening your MediDesk workspace.',
        'success'
      )

      navigate(from || `/${role}/dashboard`, { replace: true })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return <AuthFrame eyebrow="Welcome back" title="Sign in to your clinical workspace" description="Choose a demo role below or connect your Supabase Auth provider when you’re ready."><form className="auth-form" onSubmit={submit} noValidate><div className="demo-role-picker"><span className="field-label">Open a demo care workspace</span><div className="role-card-grid">{(Object.keys(roleCopy) as Role[]).map((item) => <button type="button" key={item} className={`role-card ${role === item ? 'role-card-active' : ''}`} onClick={() => { setRole(item); setEmail(item === 'patient' ? 'aarav@medidesk.demo' : item === 'doctor' ? 'sarah@medidesk.demo' : 'maya@medidesk.demo') }}><span className="role-card-icon" style={{ color: roleCopy[item].color }}>{item === 'patient' ? 'P' : item === 'doctor' ? 'D' : 'A'}</span><span><strong>{roleCopy[item].label}</strong><small>{roleCopy[item].description}</small></span>{role === item && <CheckCircle2 size={16} />}</button>)}</div></div><InputField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@clinic.com" required autoComplete="email" error={error && !email.includes('@') ? error : undefined} /><label className="field"><span>Password</span><span className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{error && email.includes('@') && <small className="field-error">{error}</small>}</label><div className="form-row"><label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label><Link to="/forgot-password" className="text-link">Forgot password?</Link></div><Button type="submit" size="lg" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></Button><div className="auth-divider"><span>New to MEDIDESK?</span></div><Link to="/register" className="btn btn-secondary btn-lg auth-submit">Create an account<ArrowRight size={17} /></Link><div className="security-note"><LockKeyhole size={15} /><span>No passwords are stored in this demo. Production authentication is designed for Supabase Auth.</span></div></form></AuthFrame>
}

export function RegisterPage() {
  const [role, setRole] = useState<Role>('patient')
  const [submitted, setSubmitted] = useState(false)
  const { push } = useToast()
  const navigate = useNavigate()
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); push('Account details saved', 'Connect this form to Supabase Auth to complete registration.', 'success'); window.setTimeout(() => navigate('/login'), 900) }
  if (submitted) return <AuthFrame eyebrow="Almost there" title="Your account is ready to connect" description="The frontend registration flow is complete. Wire the submit action to Supabase Auth for production use."><div className="success-panel"><CheckCircle2 size={30} /><strong>Registration details captured</strong><p>We’ll return you to sign in so you can choose a demo workspace.</p><Button onClick={() => navigate('/login')}>Return to sign in</Button></div></AuthFrame>
  return <AuthFrame eyebrow="Create your account" title="Start with the clinical workspace you need" description="Your role shapes the clinical tools and navigation you’ll see. Connect your verified identity when you move to production."><form className="auth-form" onSubmit={submit}><div className="role-segmented">{(['patient', 'doctor'] as Role[]).map((item) => <button key={item} type="button" className={role === item ? 'active' : ''} onClick={() => setRole(item)}>{roleCopy[item].label}</button>)}</div><div className="two-col"><InputField label="First name" placeholder="Aarav" required /><InputField label="Last name" placeholder="Mehta" required /></div><InputField label="Email address" placeholder="you@clinic.com" type="email" required /><InputField label="Create password" type="password" placeholder="At least 8 characters" hint="Use a secure password with a mix of characters." required />{role === 'doctor' && <div className="doctor-fields"><InputField label="Medical license number" placeholder="LIC-2048-CH" required /><div className="two-col"><InputField label="Specialization" placeholder="Cardiology" required /><InputField label="Experience" placeholder="8 years" required /></div><div className="two-col"><InputField label="Hospital" placeholder="Northstar Medical Center" required /><InputField label="Qualification" placeholder="MD, FACC" required /></div></div>}<label className="check-label"><input type="checkbox" required /><span>I agree to the terms and privacy policy.</span></label><Button type="submit" size="lg" className="auth-submit">Create clinical account<ArrowRight size={17} /></Button><p className="auth-switch">Already have an account? <Link to="/login" className="text-link">Sign in</Link></p></form></AuthFrame>
}

export function UtilityAuthPage({ mode }: { mode: 'forgot' | 'reset' | 'verify' }) {
  const config = mode === 'forgot' ? { eyebrow: 'Account recovery', title: 'Find your account', description: 'We’ll send a secure recovery link to the email on file.' } : mode === 'reset' ? { eyebrow: 'Account recovery', title: 'Choose a new password', description: 'This frontend is ready to connect to a secure Supabase reset flow.' } : { eyebrow: 'One last step', title: 'Verify your email', description: 'Check your inbox for the verification link to continue.' }
  const { push } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); push('Request received', 'Connect this action to your authentication provider for delivery.', 'success'); navigate('/login') }
  return <AuthFrame eyebrow={config.eyebrow} title={config.title} description={config.description}><form className="auth-form" onSubmit={submit}>{mode !== 'reset' && <InputField label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@clinic.com" required />}{mode === 'reset' && <><InputField label="New password" type="password" placeholder="At least 8 characters" required /><InputField label="Confirm password" type="password" placeholder="Repeat your new password" required /></>}{mode === 'verify' && <div className="verify-banner"><Badge tone="cyan">Demo flow</Badge><span>Verification link delivery is ready for Supabase Auth.</span></div>}<Button type="submit" size="lg" className="auth-submit">{mode === 'forgot' ? 'Send recovery link' : mode === 'reset' ? 'Save new password' : 'I’ve verified my email'}<ArrowRight size={17} /></Button><Link to="/login" className="btn btn-secondary btn-lg auth-submit">Return to sign in</Link></form></AuthFrame>
}
