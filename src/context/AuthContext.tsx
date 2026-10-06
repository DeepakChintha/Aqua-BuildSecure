import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),

    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error?.message || 'Invalid email or password'
        )
      }

      const accessToken = result.data.access_token

      localStorage.setItem('medidesk_access_token', accessToken)

      const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const meResult = await meResponse.json()

      if (!meResponse.ok || !meResult.success) {
        localStorage.removeItem('medidesk_access_token')
        throw new Error('Unable to load authenticated user')
      }

      const backendUser = meResult.data.user

      const role =
        backendUser.role ||
        backendUser.user_metadata?.role ||
        'patient'

      const name =
        backendUser.user_metadata?.full_name ||
        backendUser.email?.split('@')[0] ||
        'MediDesk User'

      setUser({
        id: backendUser.id,
        name,
        email: backendUser.email || email,
        role: role as Role,
      })
    },

    logout: async () => {
      const token = localStorage.getItem('medidesk_access_token')

      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } catch {
          // Clear the local session even if the network request fails.
        }
      }

      localStorage.removeItem('medidesk_access_token')
      setUser(null)
    },

    switchRole: (role) => {
      if (user) {
        setUser({ ...user, role })
      }
    },
  }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}