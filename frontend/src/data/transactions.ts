export type TransactionType = 'poins' | 'purchase' | 'fee' | 'transfer'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  icon: string
  status: 'completed' | 'pending'
  detail?: string
}

export const MOCK_TRANSACTIONS: Transaction[] = []

export const CURRENT_BALANCE = 0
