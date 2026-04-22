import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_TRANSACTIONS, CURRENT_BALANCE, type Transaction } from '../data/transactions'

interface WalletState {
  balance: number          // Poins disponíveis (liberados)
  blockedBalance: number   // Poins bloqueados aguardando confirmação do investimento
  transactions: Transaction[]

  purchasePackage: (productName: string, pricePoins: number) => boolean
  creditPoins: (amount: number, description: string, detail?: string) => void
  blockPoins: (amount: number, description: string) => void
  releasePoins: (amount: number, description: string) => void
  totalPurchases: () => number
  totalCredited: () => number
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: CURRENT_BALANCE,
      blockedBalance: 0,
      transactions: MOCK_TRANSACTIONS,

      purchasePackage: (productName, pricePoins) => {
        const { balance } = get()
        const fee = parseFloat((pricePoins * 0.05).toFixed(2))
        const total = pricePoins + fee
        if (balance < total) return false

        const now = new Date().toISOString()
        set(state => ({
          balance: parseFloat((state.balance - total).toFixed(2)),
          transactions: [
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
            ...state.transactions,
          ],
        }))
        return true
      },

      // Crédito direto de Poins (depósito confirmado → libera Poins)
      creditPoins: (amount, description, detail) =>
        set(state => ({
          balance: parseFloat((state.balance + amount).toFixed(2)),
          transactions: [
            {
              id: `t-${Date.now()}`,
              type: 'cashback',
              description,
              amount,
              date: new Date().toISOString(),
              icon: '💰',
              status: 'completed',
              detail,
            },
            ...state.transactions,
          ],
        })),

      // Bloqueia Poins: saem do balance disponível e ficam pendentes
      blockPoins: (amount, description) =>
        set(state => ({
          blockedBalance: parseFloat((state.blockedBalance + amount).toFixed(2)),
          transactions: [
            {
              id: `t-${Date.now()}`,
              type: 'cashback',
              description,
              amount,
              date: new Date().toISOString(),
              icon: '🔒',
              status: 'pending',
              detail: 'Aguardando confirmação do investimento',
            },
            ...state.transactions,
          ],
        })),

      // Libera Poins bloqueados para uso (investimento confirmado pelo banco)
      releasePoins: (amount, description) =>
        set(state => ({
          balance: parseFloat((state.balance + amount).toFixed(2)),
          blockedBalance: parseFloat((state.blockedBalance - amount).toFixed(2)),
          transactions: [
            {
              id: `t-${Date.now()}`,
              type: 'cashback',
              description,
              amount,
              date: new Date().toISOString(),
              icon: '✅',
              status: 'completed',
              detail: 'Investimento confirmado — Poins liberados',
            },
            ...state.transactions,
          ],
        })),

      totalPurchases: () =>
        get().transactions
          .filter(t => t.type === 'purchase')
          .reduce((acc, t) => acc + Math.abs(t.amount), 0),

      totalCredited: () =>
        get().transactions
          .filter(t => t.type === 'cashback' && t.status === 'completed')
          .reduce((acc, t) => acc + t.amount, 0),
    }),
    { name: 'pouplay-wallet' }
  )
)
