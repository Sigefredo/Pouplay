import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'

export interface InvestmentAccount {
  id: string
  institutionId: string
  institutionName: string
  accountNumber: string
  pixKey: string
  holderName: string
  holderCpf: string
}

type AccountsByUser = Record<string, InvestmentAccount[]>

interface ProfileState {
  accountsByUser: AccountsByUser
  investmentAccounts: InvestmentAccount[]
  loadUser: (userId: string) => void
  addAccount: (acc: Omit<InvestmentAccount, 'id'>) => void
  updateAccount: (id: string, acc: Omit<InvestmentAccount, 'id'>) => void
  removeAccount: (id: string) => void
}

function uid() {
  return useAuthStore.getState().user?.id ?? '__none__'
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      accountsByUser: {},
      investmentAccounts: [],

      loadUser: (userId) => {
        const accounts = get().accountsByUser[userId] ?? []
        set({ investmentAccounts: accounts })
      },

      addAccount: (acc) =>
        set(state => {
          const userId = uid()
          const newAcc: InvestmentAccount = { ...acc, id: `acc_${Date.now()}` }
          const current = state.accountsByUser[userId] ?? []
          const updated = [...current, newAcc]
          return {
            investmentAccounts: updated,
            accountsByUser: { ...state.accountsByUser, [userId]: updated },
          }
        }),

      updateAccount: (id, acc) =>
        set(state => {
          const userId = uid()
          const current = state.accountsByUser[userId] ?? []
          const updated = current.map(a => a.id === id ? { ...acc, id } : a)
          return {
            investmentAccounts: updated,
            accountsByUser: { ...state.accountsByUser, [userId]: updated },
          }
        }),

      removeAccount: (id) =>
        set(state => {
          const userId = uid()
          const current = state.accountsByUser[userId] ?? []
          const updated = current.filter(a => a.id !== id)
          return {
            investmentAccounts: updated,
            accountsByUser: { ...state.accountsByUser, [userId]: updated },
          }
        }),
    }),
    { name: 'pouplay-profile' }
  )
)
