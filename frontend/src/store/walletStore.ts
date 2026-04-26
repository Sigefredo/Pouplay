import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_TRANSACTIONS, CURRENT_BALANCE, type Transaction } from '../data/transactions'
import { useAuthStore } from './authStore'

type UserWallet = {
  balance: number
  blockedBalance: number
  transactions: Transaction[]
}

const EMPTY_WALLET: UserWallet = { balance: 0, blockedBalance: 0, transactions: [] }

// Mock data is scoped to João Silva (u1) only
const DEMO_WALLETS: Record<string, UserWallet> = {
  u1: { balance: CURRENT_BALANCE, blockedBalance: 0, transactions: MOCK_TRANSACTIONS },
}

function uid() {
  return useAuthStore.getState().user?.id ?? '__none__'
}

function pickWallet(wallets: Record<string, UserWallet>, userId: string): UserWallet {
  return wallets[userId] ?? DEMO_WALLETS[userId] ?? EMPTY_WALLET
}

function saveWallet(
  wallets: Record<string, UserWallet>,
  userId: string,
  patch: Partial<UserWallet>,
  base: UserWallet
): Record<string, UserWallet> {
  return { ...wallets, [userId]: { ...base, ...patch } }
}

interface WalletState {
  balance: number
  blockedBalance: number
  transactions: Transaction[]
  wallets: Record<string, UserWallet>

  loadUser: (userId: string) => void
  purchasePackage: (productName: string, pricePoins: number) => boolean
  creditPoins: (amount: number, description: string, detail?: string) => void
  blockPoins: (amount: number, description: string) => void
  releasePoins: (amount: number, description: string) => void
  totalPurchases: () => number
  totalPoinsReleased: () => number
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      blockedBalance: 0,
      transactions: [],
      wallets: DEMO_WALLETS,

      loadUser: (userId) => {
        const wallet = pickWallet(get().wallets, userId)
        set({ balance: wallet.balance, blockedBalance: wallet.blockedBalance, transactions: wallet.transactions })
      },

      purchasePackage: (productName, pricePoins) => {
        const { balance } = get()
        const fee = parseFloat((pricePoins * 0.05).toFixed(2))
        const total = pricePoins + fee
        if (balance < total) return false

        const userId = uid()
        const now = new Date().toISOString()
        set(s => {
          const newBalance = parseFloat((s.balance - total).toFixed(2))
          const newTx: Transaction[] = [
            { id: `t-${Date.now()}`, type: 'purchase', description: `Compra — ${productName}`, amount: -pricePoins, date: now, icon: '🎮', status: 'completed' },
            { id: `t-${Date.now()}-fee`, type: 'fee', description: 'Taxa de serviço', amount: -fee, date: now, icon: '💳', status: 'completed', detail: `Taxa sobre compra de P$ ${pricePoins.toFixed(2)}` },
            ...s.transactions,
          ]
          const base = { balance: newBalance, blockedBalance: s.blockedBalance, transactions: newTx }
          return { ...base, wallets: saveWallet(s.wallets, userId, base, base) }
        })
        return true
      },

      creditPoins: (amount, description, detail) => {
        const userId = uid()
        set(s => {
          const newBalance = parseFloat((s.balance + amount).toFixed(2))
          const newTx: Transaction[] = [
            { id: `t-${Date.now()}`, type: 'poins', description, amount, date: new Date().toISOString(), icon: '💰', status: 'completed', detail },
            ...s.transactions,
          ]
          const base = { balance: newBalance, blockedBalance: s.blockedBalance, transactions: newTx }
          return { ...base, wallets: saveWallet(s.wallets, userId, base, base) }
        })
      },

      blockPoins: (amount, description) => {
        const userId = uid()
        set(s => {
          const newBlocked = parseFloat((s.blockedBalance + amount).toFixed(2))
          const newTx: Transaction[] = [
            { id: `t-${Date.now()}`, type: 'poins', description, amount, date: new Date().toISOString(), icon: '🔒', status: 'pending', detail: 'Aguardando confirmação do investimento' },
            ...s.transactions,
          ]
          const base = { balance: s.balance, blockedBalance: newBlocked, transactions: newTx }
          return { blockedBalance: newBlocked, transactions: newTx, wallets: saveWallet(s.wallets, userId, base, base) }
        })
      },

      releasePoins: (amount, description) => {
        const userId = uid()
        set(s => {
          const newBalance = parseFloat((s.balance + amount).toFixed(2))
          const newBlocked = parseFloat((s.blockedBalance - amount).toFixed(2))
          const newTx: Transaction[] = [
            { id: `t-${Date.now()}`, type: 'poins', description, amount, date: new Date().toISOString(), icon: '✅', status: 'completed', detail: 'Investimento confirmado — Poins liberados' },
            ...s.transactions,
          ]
          const base = { balance: newBalance, blockedBalance: newBlocked, transactions: newTx }
          return { ...base, wallets: saveWallet(s.wallets, userId, base, base) }
        })
      },

      totalPurchases: () =>
        get().transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + Math.abs(t.amount), 0),

      totalPoinsReleased: () =>
        get().transactions.filter(t => t.type === 'poins' && t.status === 'completed').reduce((acc, t) => acc + t.amount, 0),
    }),
    {
      name: 'pouplay-wallet',
      version: 2,
      migrate: () => ({ balance: 0, blockedBalance: 0, transactions: [], wallets: DEMO_WALLETS }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const userId = useAuthStore.getState().user?.id
        if (userId) state.loadUser(userId)
      },
    }
  )
)
