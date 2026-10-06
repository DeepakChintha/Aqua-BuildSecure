import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { demoUsers } from '../data'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (role: Role, email: string) => Promise<void>
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    login: async (role, email) => {
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      setUser({ ...demoUsers[role], email: email || demoUsers[role].email })
    },
    logout: () => setUser(null),
    switchRole: (role) => setUser({ ...demoUsers[role] }),
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
