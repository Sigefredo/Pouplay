import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Deposit {
  id: string
  amount: number         // valor total depositado via PIX
  poinsPercent: number   // % destinado a Poins
  poinsAmount: number    // valor em Poins gerado
  serviceFee: number     // taxa da plataforma (5% sobre os Poins)
  netAmount: number      // valor líquido disponível para investir
  remainingNet: number   // saldo ainda não investido
  status: 'awaiting_pix' | 'confirmed'
  createdAt: string
  confirmedAt?: string
}

export interface Investment {
  id: string
  depositId: string
  productId: string
  productName: string
  institution: string
  institutionLogo: string
  amount: number
  poinsReleased: number
  status: 'pending' | 'confirmed'
  investedAt: string
  confirmedAt?: string
  pixKey: string
  trackingId: string
  beneficiaryName: string
  beneficiaryCpf: string
}

interface DepositState {
  deposits: Deposit[]
  investments: Investment[]

  addDeposit: (d: Deposit) => void
  confirmDeposit: (id: string) => void

  addInvestment: (inv: Investment) => void
  confirmInvestment: (id: string) => void

  availableNetBalance: () => number
  pendingInvestmentsCount: () => number
  totalInvested: () => number
}

export const useDepositStore = create<DepositState>()(
  persist(
    (set, get) => ({
      deposits: [],
      investments: [],

      addDeposit: (d) =>
        set(state => ({ deposits: [d, ...state.deposits] })),

      confirmDeposit: (id) =>
        set(state => ({
          deposits: state.deposits.map(d =>
            d.id === id
              ? { ...d, status: 'confirmed', confirmedAt: new Date().toISOString() }
              : d
          ),
        })),

      addInvestment: (inv) =>
        set(state => ({
          investments: [inv, ...state.investments],
          deposits: state.deposits.map(d =>
            d.id === inv.depositId
              ? { ...d, remainingNet: parseFloat((d.remainingNet - inv.amount).toFixed(2)) }
              : d
          ),
        })),

      confirmInvestment: (id) =>
        set(state => ({
          investments: state.investments.map(inv =>
            inv.id === id
              ? { ...inv, status: 'confirmed', confirmedAt: new Date().toISOString() }
              : inv
          ),
        })),

      availableNetBalance: () =>
        get().deposits
          .filter(d => d.status === 'confirmed')
          .reduce((acc, d) => acc + d.remainingNet, 0),

      pendingInvestmentsCount: () =>
        get().investments.filter(inv => inv.status === 'pending').length,

      totalInvested: () =>
        get().investments
          .filter(inv => inv.status === 'confirmed')
          .reduce((acc, inv) => acc + inv.amount, 0),
    }),
    { name: 'pouplay-deposits' }
  )
)
