import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReferralStatus = 'clicked' | 'poins_pending' | 'poins_released'

export interface Referral {
  id: string
  productId: string
  productName: string
  institution: string
  institutionLogo: string
  poinsEarned: number
  referralCode: string
  referralUrl: string
  status: ReferralStatus
  clickedAt: string
  poinsReleasedAt?: string
}

interface InvestmentState {
  referrals: Referral[]
  addReferral: (r: Referral) => void
  updateStatus: (referralCode: string, status: ReferralStatus, poinsReleasedAt?: string) => void
  pendingCount: () => number
  totalReceived: () => number
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      referrals: [],

      addReferral: (r) =>
        set(state => ({ referrals: [r, ...state.referrals] })),

      updateStatus: (referralCode, status, poinsReleasedAt) =>
        set(state => ({
          referrals: state.referrals.map(r =>
            r.referralCode === referralCode ? { ...r, status, poinsReleasedAt } : r
          ),
        })),

      pendingCount: () =>
        get().referrals.filter(r => r.status !== 'poins_released').length,

      totalReceived: () =>
        get().referrals
          .filter(r => r.status === 'poins_released')
          .reduce((acc, r) => acc + r.poinsEarned, 0),
    }),
    { name: 'pouplay-investments' }
  )
)
