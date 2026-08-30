import { createContext } from 'react'
import type { User } from '@/types'

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
