import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_TRANSACTIONS, CURRENT_BALANCE, type Transaction } from '../data/transactions'

interface WalletState {
  balance: number
  transactions: Transaction[]
  purchasePackage: (productName: string, pricePoins: number) => boolean
  totalCashback: () => number
  totalPurchases: () => number
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: CURRENT_BALANCE,
      transactions: MOCK_TRANSACTIONS,

      purchasePackage: (productName, pricePoins) => {
        const { balance } = get()
        const fee = parseFloat((pricePoins * 0.05).toFixed(2))
        const total = pricePoins + fee
        if (balance < total) return false

        const now = new Date().toISOString()
        const newTransactions: Transaction[] = [
          {
            id: `t-${Date.now()}`,
            type: 'purchase',
            description: `Compra — ${productName}`,
            amount: -pricePoins,
            date: now,
            icon: '🎮',
            status: 'completed',
          },
          {
            id: `t-${Date.now()}-fee`,
            type: 'fee',
            description: 'Taxa de serviço',
            amount: -fee,
            date: now,
            icon: '💳',
            status: 'completed',
            detail: `Taxa sobre compra de P$ ${pricePoins.toFixed(2)}`,
          },
        ]

        set(state => ({
          balance: parseFloat((state.balance - total).toFixed(2)),
          transactions: [...newTransactions, ...state.transactions],
        }))
        return true
      },

      totalCashback: () =>
        get().transactions
          .filter(t => t.type === 'cashback')
          .reduce((acc, t) => acc + t.amount, 0),

      totalPurchases: () =>
        get().transactions
          .filter(t => t.type === 'purchase')
          .reduce((acc, t) => acc + Math.abs(t.amount), 0),
    }),
    { name: 'pouplay-wallet' }
  )
)
