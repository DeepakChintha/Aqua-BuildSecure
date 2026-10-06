import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ToastItem { id: number; title: string; message: string; tone: 'success' | 'info' | 'danger' }
interface ToastContextValue { push: (title: string, message: string, tone?: ToastItem['tone']) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((title: string, message: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now()
    setItems((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3600)
  }, [])
  const value = useMemo(() => ({ push }), [push])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((item) => <div key={item.id} className={`toast toast-${item.tone}`}><strong>{item.title}</strong><span>{item.message}</span></div>)}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
