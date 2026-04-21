import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReferralStatus = 'clicked' | 'cashback_pending' | 'cashback_received'

export interface Referral {
  id: string
  productId: string
  productName: string
  institution: string
  institutionLogo: string
  cashbackPoins: number
  referralCode: string
  referralUrl: string
  status: ReferralStatus
  clickedAt: string
  cashbackReceivedAt?: string
}

interface InvestmentState {
  referrals: Referral[]
  addReferral: (r: Referral) => void
  updateStatus: (referralCode: string, status: ReferralStatus, cashbackReceivedAt?: string) => void
  pendingCount: () => number
  totalReceived: () => number
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      referrals: [],

      addReferral: (r) =>
        set(state => ({ referrals: [r, ...state.referrals] })),

      updateStatus: (referralCode, status, cashbackReceivedAt) =>
        set(state => ({
          referrals: state.referrals.map(r =>
            r.referralCode === referralCode ? { ...r, status, cashbackReceivedAt } : r
          ),
        })),

      pendingCount: () =>
        get().referrals.filter(r => r.status !== 'cashback_received').length,

      totalReceived: () =>
        get().referrals
          .filter(r => r.status === 'cashback_received')
          .reduce((acc, r) => acc + r.cashbackPoins, 0),
    }),
    { name: 'pouplay-investments' }
  )
)
