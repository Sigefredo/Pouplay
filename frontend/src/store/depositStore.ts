import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'
import { depositExpiresAt, businessDaysUntil } from '../utils/businessDays'

export interface ChildAllocation {
  childId: string
  childName: string
  percent: number
  poinsAmount: number
}

export interface Deposit {
  id: string
  amount: number
  poinsPercent: number
  poinsAmount: number
  serviceFee: number
  netAmount: number
  remainingNet: number
  status: 'awaiting_pix' | 'confirmed' | 'return_requested'
  createdAt: string
  confirmedAt?: string
  returnRequestedAt?: string
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

const MOCK_DEPOSITS: Deposit[] = []

const MOCK_INVESTMENTS: Investment[] = []

type UserDeposits = { deposits: Deposit[]; investments: Investment[] }
const EMPTY_DEPOSITS: UserDeposits = { deposits: [], investments: [] }

// Mock data scoped to João Silva (u1) only
const DEMO_DEPOSITS: Record<string, UserDeposits> = {
  u1: { deposits: MOCK_DEPOSITS, investments: MOCK_INVESTMENTS },
}

function uid() {
  return useAuthStore.getState().user?.id ?? '__none__'
}

function pickDeposits(userDeposits: Record<string, UserDeposits>, userId: string): UserDeposits {
  return userDeposits[userId] ?? DEMO_DEPOSITS[userId] ?? EMPTY_DEPOSITS
}

interface DepositState {
  deposits: Deposit[]
  investments: Investment[]
  userDeposits: Record<string, UserDeposits>

  loadUser: (userId: string) => void
  addDeposit: (d: Deposit) => void
  confirmDeposit: (id: string) => void
  addInvestment: (inv: Investment) => void
  confirmInvestment: (id: string) => void
  requestReturn: (id: string) => void
  availableNetBalance: () => number
  pendingInvestmentsCount: () => number
  totalInvested: () => number
  urgentDepositsCount: () => number
  depositsForChild: (childId: string) => Deposit[]
}

export const useDepositStore = create<DepositState>()(
  persist(
    (set, get) => ({
      deposits: [],
      investments: [],
      userDeposits: DEMO_DEPOSITS,

      loadUser: (userId) => {
        const state = get()
        const role = useAuthStore.getState().user?.role

        if (role === 'menor') {
          // Child investments live in parent buckets; aggregate across all of them
          const seen = new Set<string>()
          const childInvestments: Investment[] = []
          const allBuckets = { ...DEMO_DEPOSITS, ...state.userDeposits }
          Object.values(allBuckets).forEach(bucket => {
            bucket.investments.forEach(inv => {
              if (inv.childId === userId && !seen.has(inv.id)) {
                seen.add(inv.id)
                childInvestments.push(inv)
              }
            })
          })
          set({ deposits: [], investments: childInvestments })
        } else {
          const { deposits, investments } = pickDeposits(state.userDeposits, userId)
          set({ deposits, investments })
        }
      },

      addDeposit: (d) =>
        set(s => {
          const userId = uid()
          const newDeposits = [d, ...s.deposits]
          return {
            deposits: newDeposits,
            userDeposits: { ...s.userDeposits, [userId]: { deposits: newDeposits, investments: s.investments } },
          }
        }),

      confirmDeposit: (id) =>
        set(s => {
          const userId = uid()
          const newDeposits = s.deposits.map(d =>
            d.id === id ? { ...d, status: 'confirmed' as const, confirmedAt: new Date().toISOString() } : d
          )
          return {
            deposits: newDeposits,
            userDeposits: { ...s.userDeposits, [userId]: { deposits: newDeposits, investments: s.investments } },
          }
        }),

      addInvestment: (inv) =>
        set(s => {
          const userId = uid()
          const newInvestments = [inv, ...s.investments]
          const newDeposits = s.deposits.map(d =>
            d.id === inv.depositId
              ? { ...d, remainingNet: parseFloat((d.remainingNet - inv.amount).toFixed(2)) }
              : d
          )
          return {
            investments: newInvestments,
            deposits: newDeposits,
            userDeposits: { ...s.userDeposits, [userId]: { deposits: newDeposits, investments: newInvestments } },
          }
        }),

      confirmInvestment: (id) =>
        set(s => {
          const userId = uid()
          const newInvestments = s.investments.map(inv =>
            inv.id === id ? { ...inv, status: 'confirmed' as const, confirmedAt: new Date().toISOString() } : inv
          )
          return {
            investments: newInvestments,
            userDeposits: { ...s.userDeposits, [userId]: { deposits: s.deposits, investments: newInvestments } },
          }
        }),

      requestReturn: (id) =>
        set(s => {
          const userId = uid()
          const newDeposits = s.deposits.map(d =>
            d.id === id
              ? { ...d, status: 'return_requested' as const, returnRequestedAt: new Date().toISOString() }
              : d
          )
          return {
            deposits: newDeposits,
            userDeposits: { ...s.userDeposits, [userId]: { deposits: newDeposits, investments: s.investments } },
          }
        }),

      availableNetBalance: () =>
        get().deposits.filter(d => d.status === 'confirmed').reduce((acc, d) => acc + d.remainingNet, 0),

      pendingInvestmentsCount: () =>
        get().investments.filter(inv => inv.status === 'pending').length,

      totalInvested: () =>
        get().investments.filter(inv => inv.status === 'confirmed').reduce((acc, inv) => acc + inv.amount, 0),

      urgentDepositsCount: () =>
        get().deposits.filter(d => {
          if (d.status !== 'confirmed' || d.remainingNet <= 0) return false
          return businessDaysUntil(depositExpiresAt(d.confirmedAt!)) <= 2
        }).length,

      depositsForChild: (childId) => {
        const state = get()
        const allBuckets = { ...DEMO_DEPOSITS, ...state.userDeposits }
        const seen = new Set<string>()
        const result: Deposit[] = []
        Object.values(allBuckets).forEach(bucket => {
          bucket.deposits.forEach(dep => {
            if (!seen.has(dep.id) && dep.childAllocations?.some(a => a.childId === childId)) {
              seen.add(dep.id)
              result.push(dep)
            }
          })
        })
        return result
      },
    }),
    {
      name: 'pouplay-deposits',
      version: 4,
      migrate: () => ({ deposits: [], investments: [], userDeposits: DEMO_DEPOSITS }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const userId = useAuthStore.getState().user?.id
        if (userId) state.loadUser(userId)
      },
    }
  )
)
