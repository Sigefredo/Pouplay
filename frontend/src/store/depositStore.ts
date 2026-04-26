import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChildAllocation {
  childId: string
  childName: string
  percent: number
  poinsAmount: number
}

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
  childAllocations?: ChildAllocation[]
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
  childId?: string
}

const MOCK_DEPOSITS: Deposit[] = [
  {
    id: 'dep-mock-1',
    amount: 1000,
    poinsPercent: 10,
    poinsAmount: 100,
    serviceFee: 5,
    netAmount: 895,
    remainingNet: 0,
    status: 'confirmed',
    createdAt: '2026-03-16T10:00:00',
    confirmedAt: '2026-03-16T10:30:00',
    childAllocations: [
      { childId: 'u2', childName: 'Mateus Gamer', percent: 100, poinsAmount: 100 },
    ],
  },
  {
    id: 'dep-mock-2',
    amount: 500,
    poinsPercent: 10,
    poinsAmount: 50,
    serviceFee: 2.5,
    netAmount: 447.5,
    remainingNet: 0,
    status: 'confirmed',
    createdAt: '2026-04-02T09:00:00',
    confirmedAt: '2026-04-02T09:20:00',
    childAllocations: [
      { childId: 'u3', childName: 'Lua Silva', percent: 100, poinsAmount: 50 },
    ],
  },
  {
    id: 'dep-mock-3',
    amount: 300,
    poinsPercent: 10,
    poinsAmount: 30,
    serviceFee: 1.5,
    netAmount: 268.5,
    remainingNet: 0,
    status: 'confirmed',
    createdAt: '2026-04-10T14:00:00',
    confirmedAt: '2026-04-10T14:15:00',
    childAllocations: [
      { childId: 'u3', childName: 'Lua Silva', percent: 100, poinsAmount: 30 },
    ],
  },
]

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv-mock-1',
    depositId: 'dep-mock-1',
    productId: 'fp8',
    productName: 'CDB Infantil 108% CDI',
    institution: 'BancoFlex',
    institutionLogo: 'BF',
    amount: 895,
    poinsReleased: 100,
    status: 'confirmed',
    investedAt: '2026-03-17T11:00:00',
    confirmedAt: '2026-03-18T09:00:00',
    pixKey: 'mateus@bancoflex.com.br',
    trackingId: 'POI-20260317-MAT001',
    beneficiaryName: 'Mateus Gamer',
    beneficiaryCpf: '987.654.321-00',
    childId: 'u2',
  },
  {
    id: 'inv-mock-2',
    depositId: 'dep-mock-2',
    productId: 'fp2',
    productName: 'Tesouro Selic 2029',
    institution: 'Corretora Investe+',
    institutionLogo: 'CI',
    amount: 447.5,
    poinsReleased: 50,
    status: 'confirmed',
    investedAt: '2026-04-03T10:00:00',
    confirmedAt: '2026-04-03T15:00:00',
    pixKey: 'lua@corretorainveste.com.br',
    trackingId: 'POI-20260403-LUA001',
    beneficiaryName: 'Lua Silva',
    beneficiaryCpf: '111.222.333-44',
    childId: 'u3',
  },
  {
    id: 'inv-mock-3',
    depositId: 'dep-mock-3',
    productId: 'fp8',
    productName: 'CDB Infantil 108% CDI',
    institution: 'BancoFlex',
    institutionLogo: 'BF',
    amount: 268.5,
    poinsReleased: 30,
    status: 'pending',
    investedAt: '2026-04-10T15:00:00',
    pixKey: 'lua@bancoflex.com.br',
    trackingId: 'POI-20260410-LUA002',
    beneficiaryName: 'Lua Silva',
    beneficiaryCpf: '111.222.333-44',
    childId: 'u3',
  },
]

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
      deposits: MOCK_DEPOSITS,
      investments: MOCK_INVESTMENTS,

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
    {
      name: 'pouplay-deposits',
      version: 1,
      migrate: () => ({
        deposits: MOCK_DEPOSITS,
        investments: MOCK_INVESTMENTS,
      }),
    }
  )
)
