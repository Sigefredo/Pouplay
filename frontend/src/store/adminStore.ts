import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_USERS, type User } from '../data/users'

export type ProductType = 'CDB' | 'LCA' | 'LCI' | 'Tesouro Direto' | 'Fundo DI' | 'Poupança+'
export type TagColor   = 'green' | 'blue' | 'purple' | 'orange' | 'pink'
export type DeliveryMethod = 'account_credit' | 'redeem_code'

export interface ChildPixAccount {
  id: string
  institutionId: string
  institutionName: string
  pixKey: string
}

export interface ManagedUser extends User {
  active: boolean
  pixAccounts: ChildPixAccount[]
}

export interface AdminProduct {
  id: string
  name: string
  type: ProductType
  rate: string
  minValue: number
  tag?: string
  tagColor?: TagColor
  popular: boolean
}

export interface AdminInstitution {
  id: string
  name: string
  cnpj: string
  pixKey: string
  commissionPercent: number
  createdAt: string
  products: AdminProduct[]
}

export interface AdminPackage {
  id: string
  gameId: string
  gameName: string
  packageName: string
  coinAmount: number
  coinName: string
  pricePoins: number
  deliveryMethod: DeliveryMethod
  active: boolean
  bonus?: string
  category?: 'moeda' | 'gift_card'
  redeemUrl?: string
  label?: string
}

export interface AdminGamePartner {
  id: string
  name: string
  apiKey: string
  merchantId: string
  createdAt: string
  packages: AdminPackage[]
}

interface AdminState {
  institutions: AdminInstitution[]
  gamePartners: AdminGamePartner[]
  users: ManagedUser[]

  addInstitution:    (data: Omit<AdminInstitution, 'id' | 'createdAt' | 'products'>) => void
  updateInstitution: (id: string, data: Partial<Omit<AdminInstitution, 'id' | 'products'>>) => void
  deleteInstitution: (id: string) => void

  addProduct:    (institutionId: string, p: Omit<AdminProduct, 'id'>) => void
  updateProduct: (institutionId: string, productId: string, data: Partial<Omit<AdminProduct, 'id'>>) => void
  deleteProduct: (institutionId: string, productId: string) => void

  addGamePartner:    (data: Omit<AdminGamePartner, 'id' | 'createdAt' | 'packages'>) => void
  updateGamePartner: (id: string, data: Partial<Omit<AdminGamePartner, 'id' | 'packages'>>) => void
  deleteGamePartner: (id: string) => void

  addPackage:    (partnerId: string, pkg: Omit<AdminPackage, 'id'>) => void
  updatePackage: (partnerId: string, pkgId: string, data: Partial<Omit<AdminPackage, 'id'>>) => void
  deletePackage: (partnerId: string, pkgId: string) => void

  addUser:           (data: Omit<ManagedUser, 'id'>) => void
  toggleUserActive:  (id: string) => void
  deleteUser:        (id: string) => void

  addPixAccount:    (userId: string, account: Omit<ChildPixAccount, 'id'>) => void
  removePixAccount: (userId: string, accountId: string) => void
}

const SEED_INSTITUTIONS: AdminInstitution[] = [
  { id: 'inst01', name: 'Nubank',                 cnpj: '18.236.120/0001-58', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst02', name: 'Banco Inter',             cnpj: '00.416.968/0001-01', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst03', name: 'C6 Bank',                 cnpj: '31.872.495/0001-72', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst04', name: 'Neon',                    cnpj: '20.855.875/0001-82', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst05', name: 'PicPay',                  cnpj: '22.896.431/0001-10', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst06', name: 'Mercado Pago',            cnpj: '10.573.521/0001-91', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst07', name: 'PagBank',                 cnpj: '08.561.701/0001-01', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst08', name: 'Banco do Brasil',         cnpj: '00.000.000/0001-91', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst09', name: 'Caixa Econômica Federal', cnpj: '00.360.305/0001-04', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst10', name: 'Bradesco',                cnpj: '60.746.948/0001-12', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst11', name: 'Itaú Unibanco',           cnpj: '60.701.190/0001-04', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
  { id: 'inst12', name: 'Santander Brasil',        cnpj: '90.400.888/0001-42', pixKey: '', commissionPercent: 0, createdAt: '2026-05-01T00:00:00.000Z', products: [] },
]

const SEED_GAME_PARTNERS: AdminGamePartner[] = [
  {
    id: 'gp1',
    name: 'Boa Compra',
    apiKey: '', merchantId: '',
    createdAt: '2026-05-01T00:00:00.000Z',
    packages: [],
  },
  {
    id: 'gp2',
    name: 'Garena Brasil',
    apiKey: '', merchantId: '',
    createdAt: '2026-05-01T00:00:00.000Z',
    packages: [],
  },
  {
    id: 'gp3',
    name: 'Riot Games Brasil',
    apiKey: '', merchantId: '',
    createdAt: '2026-05-01T00:00:00.000Z',
    packages: [],
  },
  {
    id: 'gp4',
    name: 'Eneba for Business',
    apiKey: '', merchantId: '',
    createdAt: '2026-05-01T00:00:00.000Z',
    packages: [],
  },
  {
    id: 'gp5',
    name: 'Kinguin for Business',
    apiKey: '', merchantId: '',
    createdAt: '2026-05-01T00:00:00.000Z',
    packages: [],
  },
]

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      institutions: SEED_INSTITUTIONS,
      gamePartners:  SEED_GAME_PARTNERS,
      users: MOCK_USERS.map(u => {
        const pixAccounts: ChildPixAccount[] =
          u.id === 'u2' ? [{ id: 'pix_u2_1', institutionId: 'inst1', institutionName: 'Banco Digital Plus',  pixKey: 'mateus@bancodigitalplus.com.br' }] :
          u.id === 'u3' ? [{ id: 'pix_u3_1', institutionId: 'inst2', institutionName: 'Corretora Investe+', pixKey: 'lua@corretoraeinveste.com.br'    }] :
          []
        return { ...u, active: u.active ?? true, pixAccounts }
      }),

      addInstitution: (data) =>
        set(s => ({ institutions: [...s.institutions, { ...data, id: `inst_${Date.now()}`, createdAt: new Date().toISOString(), products: [] }] })),

      updateInstitution: (id, data) =>
        set(s => ({ institutions: s.institutions.map(i => i.id === id ? { ...i, ...data } : i) })),

      deleteInstitution: (id) =>
        set(s => ({ institutions: s.institutions.filter(i => i.id !== id) })),

      addProduct: (institutionId, p) =>
        set(s => ({
          institutions: s.institutions.map(i =>
            i.id === institutionId ? { ...i, products: [...i.products, { ...p, id: `prod_${Date.now()}` }] } : i
          ),
        })),

      updateProduct: (institutionId, productId, data) =>
        set(s => ({
          institutions: s.institutions.map(i =>
            i.id === institutionId
              ? { ...i, products: i.products.map(p => p.id === productId ? { ...p, ...data } : p) }
              : i
          ),
        })),

      deleteProduct: (institutionId, productId) =>
        set(s => ({
          institutions: s.institutions.map(i =>
            i.id === institutionId ? { ...i, products: i.products.filter(p => p.id !== productId) } : i
          ),
        })),

      addGamePartner: (data) =>
        set(s => ({ gamePartners: [...s.gamePartners, { ...data, id: `gp_${Date.now()}`, createdAt: new Date().toISOString(), packages: [] }] })),

      updateGamePartner: (id, data) =>
        set(s => ({ gamePartners: s.gamePartners.map(g => g.id === id ? { ...g, ...data } : g) })),

      deleteGamePartner: (id) =>
        set(s => ({ gamePartners: s.gamePartners.filter(g => g.id !== id) })),

      addPackage: (partnerId, pkg) =>
        set(s => ({
          gamePartners: s.gamePartners.map(g =>
            g.id === partnerId ? { ...g, packages: [...g.packages, { ...pkg, id: `pkg_${Date.now()}` }] } : g
          ),
        })),

      updatePackage: (partnerId, pkgId, data) =>
        set(s => ({
          gamePartners: s.gamePartners.map(g =>
            g.id === partnerId
              ? { ...g, packages: g.packages.map(p => p.id === pkgId ? { ...p, ...data } : p) }
              : g
          ),
        })),

      deletePackage: (partnerId, pkgId) =>
        set(s => ({
          gamePartners: s.gamePartners.map(g =>
            g.id === partnerId ? { ...g, packages: g.packages.filter(p => p.id !== pkgId) } : g
          ),
        })),

      addUser: (data) =>
        set(s => ({ users: [...s.users, { ...data, id: `u_${Date.now()}` }] })),

      toggleUserActive: (id) =>
        set(s => ({ users: s.users.map(u => u.id === id ? { ...u, active: !u.active } : u) })),

      deleteUser: (id) =>
        set(s => ({ users: s.users.filter(u => u.id !== id) })),

      addPixAccount: (userId, account) =>
        set(s => ({
          users: s.users.map(u =>
            u.id === userId
              ? { ...u, pixAccounts: [...(u.pixAccounts ?? []), { ...account, id: `pix_${Date.now()}` }] }
              : u
          ),
        })),

      removePixAccount: (userId, accountId) =>
        set(s => ({
          users: s.users.map(u =>
            u.id === userId
              ? { ...u, pixAccounts: (u.pixAccounts ?? []).filter(p => p.id !== accountId) }
              : u
          ),
        })),
    }),
    {
      name: 'pouplay-admin',
      version: 3,
      migrate: () => ({
        institutions: SEED_INSTITUTIONS,
        gamePartners:  SEED_GAME_PARTNERS,
        users: [],
      }),
    }
  )
)
