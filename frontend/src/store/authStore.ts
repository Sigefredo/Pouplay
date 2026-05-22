import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_USERS, CREDENTIALS, type User } from '../data/users'

export interface RegisterData {
  name: string
  email: string
  password: string
  cpf: string
  phone?: string
  birthDate: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  registeredUsers: User[]
  registeredCredentials: { email: string; password: string; userId: string }[]
  onboardedUserIds: string[]
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (data: RegisterData) => { ok: boolean; error?: string }
  registerChild: (user: User, password: string) => void
  markOnboarded: (userId: string) => void
  switchProfile: (userId: string) => void
  switchProfileObj: (user: User) => void
  linkedUser: () => User | null
}

function makeAvatar(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function allUsers(registeredUsers: User[]): User[] {
  return [...MOCK_USERS, ...registeredUsers]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: [],
      registeredCredentials: [],
      // Demo users are pre-seeded so they never see the onboarding popup
      onboardedUserIds: ['u0', 'u1', 'u2', 'u3', 'u4'],

      login: (email, password) => {
        const { registeredUsers, registeredCredentials } = get()
        const emailNorm = email.trim().toLowerCase()
        const cred =
          CREDENTIALS.find(c => c.email === emailNorm && c.password === password) ??
          registeredCredentials.find(c => c.email === emailNorm && c.password === password)
        if (!cred) return false
        const user = allUsers(registeredUsers).find(u => u.id === cred.userId)
        if (!user) return false
        set({ user, isAuthenticated: true })
        return true
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      register: (data) => {
        const { registeredUsers, registeredCredentials } = get()
        const users = allUsers(registeredUsers)
        const emailNorm = data.email.trim().toLowerCase()
        const cpfDigits = data.cpf.replace(/\D/g, '')

        if (users.some(u => u.email.toLowerCase() === emailNorm))
          return { ok: false, error: 'E-mail já cadastrado.' }
        if (users.some(u => u.cpf.replace(/\D/g, '') === cpfDigits))
          return { ok: false, error: 'CPF já cadastrado.' }

        const id = `u_${Date.now()}`
        const cpfFormatted = cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        const newUser: User = {
          id,
          name: data.name.trim(),
          email: emailNorm,
          role: 'responsavel',
          avatar: makeAvatar(data.name),
          cpf: cpfFormatted,
          phone: data.phone?.trim() || undefined,
          birthDate: data.birthDate,
          active: true,
        }

        set({
          registeredUsers: [...registeredUsers, newUser],
          registeredCredentials: [
            ...registeredCredentials,
            { email: emailNorm, password: data.password, userId: id },
          ],
        })
        return { ok: true }
      },

      registerChild: (user, password) => {
        const { registeredUsers, registeredCredentials } = get()
        const emailNorm = user.email.trim().toLowerCase()
        set({
          registeredUsers: [...registeredUsers, { ...user, email: emailNorm }],
          registeredCredentials: [...registeredCredentials, { email: emailNorm, password, userId: user.id }],
        })
      },

      markOnboarded: (userId) =>
        set(s => ({ onboardedUserIds: [...s.onboardedUserIds, userId] })),

      switchProfile: (userId) => {
        const { registeredUsers } = get()
        const user = allUsers(registeredUsers).find(u => u.id === userId)
        if (user) set({ user })
      },

      switchProfileObj: (user) => set({ user }),

      linkedUser: () => {
        const { user, registeredUsers } = get()
        if (!user) return null
        const users = allUsers(registeredUsers)
        if (user.role === 'responsavel') {
          return users.find(u => u.linkedTo === user.id) ?? null
        }
        return users.find(u => u.id === user.linkedTo) ?? null
      },
    }),
    {
      name: 'pouplay-auth',
      version: 1,
      migrate: (persisted: any) => ({
        user: persisted.user ?? null,
        isAuthenticated: persisted.isAuthenticated ?? false,
        registeredUsers: persisted.registeredUsers ?? [],
        registeredCredentials: persisted.registeredCredentials ?? [],
        // Reset onboarding: keeps only demo users, so any registered user sees the popup again
        onboardedUserIds: ['u0', 'u1', 'u2', 'u3', 'u4'],
      }),
    }
  )
)
