import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_USERS, CREDENTIALS, type User } from '../data/users'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  switchProfile: (userId: string) => void
  linkedUser: () => User | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const cred = CREDENTIALS.find(c => c.email === email && c.password === password)
        if (!cred) return false
        const user = MOCK_USERS.find(u => u.id === cred.userId)
        if (!user) return false
        set({ user, isAuthenticated: true })
        return true
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      switchProfile: (userId) => {
        const user = MOCK_USERS.find(u => u.id === userId)
        if (user) set({ user })
      },

      linkedUser: () => {
        const { user } = get()
        if (!user) return null
        if (user.role === 'responsavel') {
          return MOCK_USERS.find(u => u.linkedTo === user.id) ?? null
        }
        return MOCK_USERS.find(u => u.id === user.linkedTo) ?? null
      },
    }),
    { name: 'pouplay-auth' }
  )
)
