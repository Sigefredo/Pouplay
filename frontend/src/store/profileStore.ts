import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface InvestmentAccount {
  id: string
  brokerName: string
  accountNumber: string
  pixKey: string
  holderName: string
  holderCpf: string
}

interface ProfileState {
  investmentAccounts: InvestmentAccount[]
  addAccount: (acc: Omit<InvestmentAccount, 'id'>) => void
  updateAccount: (id: string, acc: Omit<InvestmentAccount, 'id'>) => void
  removeAccount: (id: string) => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      investmentAccounts: [],
      addAccount: (acc) =>
        set(state => ({
          investmentAccounts: [...state.investmentAccounts, { ...acc, id: `acc_${Date.now()}` }],
        })),
      updateAccount: (id, acc) =>
        set(state => ({
          investmentAccounts: state.investmentAccounts.map(a => a.id === id ? { ...acc, id } : a),
        })),
      removeAccount: (id) =>
        set(state => ({
          investmentAccounts: state.investmentAccounts.filter(a => a.id !== id),
        })),
    }),
    { name: 'pouplay-profile' }
  )
)
