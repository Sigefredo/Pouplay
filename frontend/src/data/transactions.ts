export type TransactionType = 'cashback' | 'purchase' | 'fee' | 'transfer'

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

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'cashback',
    description: 'Cashback — CDB Premium 120% CDI',
    amount: +50,
    date: '2026-04-19T14:32:00',
    icon: '🏦',
    status: 'completed',
    detail: 'Banco Digital Plus · Investimento de R$ 1.000,00',
  },
  {
    id: 't2',
    type: 'purchase',
    description: 'Compra — 400 Robux · Roblox',
    amount: -39.90,
    date: '2026-04-18T20:15:00',
    icon: '🎮',
    status: 'completed',
    detail: 'Roblox Corporation · Pacote 400 Robux',
  },
  {
    id: 't3',
    type: 'fee',
    description: 'Taxa de serviço',
    amount: -1.99,
    date: '2026-04-18T20:15:01',
    icon: '💳',
    status: 'completed',
    detail: 'Taxa sobre compra de P$ 39,90',
  },
  {
    id: 't4',
    type: 'cashback',
    description: 'Cashback — LCA Agronegócio 95% CDI',
    amount: +30,
    date: '2026-04-15T10:00:00',
    icon: '🏦',
    status: 'completed',
    detail: 'BancoFlex · Investimento de R$ 500,00',
  },
  {
    id: 't5',
    type: 'cashback',
    description: 'Cashback — CDB Infantil 108% CDI',
    amount: +8,
    date: '2026-04-12T09:30:00',
    icon: '🏦',
    status: 'completed',
    detail: 'BancoFlex · Investimento de R$ 50,00',
  },
  {
    id: 't6',
    type: 'purchase',
    description: 'Compra — 310 Diamantes · Free Fire',
    amount: -24.90,
    date: '2026-04-10T17:45:00',
    icon: '🎮',
    status: 'completed',
    detail: 'Garena · Pacote 310 Diamantes',
  },
  {
    id: 't7',
    type: 'fee',
    description: 'Taxa de serviço',
    amount: -1.24,
    date: '2026-04-10T17:45:01',
    icon: '💳',
    status: 'completed',
    detail: 'Taxa sobre compra de P$ 24,90',
  },
  {
    id: 't8',
    type: 'cashback',
    description: 'Cashback — Tesouro Selic 2029',
    amount: +15,
    date: '2026-04-08T11:20:00',
    icon: '🏦',
    status: 'completed',
    detail: 'Corretora Investe+ · Investimento de R$ 100,00',
  },
  {
    id: 't9',
    type: 'cashback',
    description: 'Cashback — CDB Flex 115% CDI',
    amount: +20,
    date: '2026-04-03T08:00:00',
    icon: '🏦',
    status: 'completed',
    detail: 'XFinance · Investimento de R$ 200,00',
  },
  {
    id: 't10',
    type: 'purchase',
    description: 'Compra — 2800 V-Bucks · Fortnite',
    amount: -99.90,
    date: '2026-03-28T21:00:00',
    icon: '🎮',
    status: 'completed',
    detail: 'Epic Games · Pacote 2800 V-Bucks (+300 bônus)',
  },
  {
    id: 't11',
    type: 'fee',
    description: 'Taxa de serviço',
    amount: -4.99,
    date: '2026-03-28T21:00:01',
    icon: '💳',
    status: 'completed',
    detail: 'Taxa sobre compra de P$ 99,90',
  },
  {
    id: 't12',
    type: 'cashback',
    description: 'Cashback — Bônus de boas-vindas',
    amount: +100,
    date: '2026-03-01T00:00:00',
    icon: '🎁',
    status: 'completed',
    detail: 'Bem-vindo ao Pouplay!',
  },
]

export const CURRENT_BALANCE = 1250.08
