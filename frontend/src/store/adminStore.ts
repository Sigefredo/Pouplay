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
  {
    id: 'inst1', name: 'Banco Digital Plus', cnpj: '12.345.678/0001-90',
    pixKey: 'investimentos@bancodigitalplus.com.br', commissionPercent: 5,
    createdAt: '2024-01-10T00:00:00.000Z',
    products: [
      { id: 'p1', name: 'CDB Premium 120% CDI', type: 'CDB', rate: '120% CDI', minValue: 1000, tag: 'Mais rentável', tagColor: 'green', popular: true },
    ],
  },
  {
    id: 'inst2', name: 'Corretora Investe+', cnpj: '23.456.789/0001-01',
    pixKey: 'clientes@corretoraeinveste.com.br', commissionPercent: 3,
    createdAt: '2024-01-15T00:00:00.000Z',
    products: [
      { id: 'p2', name: 'Tesouro Selic 2029', type: 'Tesouro Direto', rate: '100% Selic', minValue: 100, tag: 'Mais seguro', tagColor: 'blue', popular: false },
      { id: 'p3', name: 'LCI Imobiliário 92% CDI', type: 'LCI', rate: '92% CDI', minValue: 500, tag: 'Isento IR', tagColor: 'purple', popular: false },
    ],
  },
  {
    id: 'inst3', name: 'BancoFlex', cnpj: '34.567.890/0001-12',
    pixKey: 'investir@bancoflex.com.br', commissionPercent: 4,
    createdAt: '2024-02-01T00:00:00.000Z',
    products: [
      { id: 'p4', name: 'LCA Agronegócio 95% CDI', type: 'LCA', rate: '95% CDI', minValue: 500, tag: 'Isento IR', tagColor: 'purple', popular: false },
      { id: 'p5', name: 'CDB Infantil 108% CDI',   type: 'CDB', rate: '108% CDI', minValue: 50, tag: 'Para famílias', tagColor: 'pink', popular: true },
    ],
  },
  {
    id: 'inst4', name: 'XFinance', cnpj: '45.678.901/0001-23',
    pixKey: 'captacao@xfinance.com.br', commissionPercent: 4,
    createdAt: '2024-02-10T00:00:00.000Z',
    products: [
      { id: 'p6', name: 'CDB Flex 115% CDI', type: 'CDB', rate: '115% CDI', minValue: 200, popular: true },
    ],
  },
  {
    id: 'inst5', name: 'SafeBank', cnpj: '56.789.012/0001-34',
    pixKey: 'poupanca@safebank.com.br', commissionPercent: 2,
    createdAt: '2024-03-01T00:00:00.000Z',
    products: [
      { id: 'p7', name: 'Poupança Turbinada', type: 'Poupança+', rate: '70% CDI', minValue: 50, tag: 'Para começar', tagColor: 'orange', popular: false },
    ],
  },
  {
    id: 'inst6', name: 'Broker360', cnpj: '67.890.123/0001-45',
    pixKey: 'fundos@broker360.com.br', commissionPercent: 4.5,
    createdAt: '2024-03-15T00:00:00.000Z',
    products: [
      { id: 'p8', name: 'Fundo DI Master', type: 'Fundo DI', rate: '110% CDI', minValue: 1000, popular: false },
    ],
  },
]

const SEED_GAME_PARTNERS: AdminGamePartner[] = [
  {
    id: 'gp1', name: 'Garena', apiKey: '', merchantId: '',
    createdAt: '2024-01-10T00:00:00.000Z',
    packages: [
      { id: 'pkg1', gameId: 'freefire', gameName: 'Free Fire', packageName: '100 Diamantes',  coinAmount: 100,  coinName: 'Diamantes', pricePoins: 9.90,  deliveryMethod: 'account_credit', active: true },
      { id: 'pkg2', gameId: 'freefire', gameName: 'Free Fire', packageName: '310 Diamantes',  coinAmount: 310,  coinName: 'Diamantes', pricePoins: 26.90, deliveryMethod: 'account_credit', active: true },
      { id: 'pkg3', gameId: 'freefire', gameName: 'Free Fire', packageName: '520 Diamantes',  coinAmount: 520,  coinName: 'Diamantes', pricePoins: 42.90, deliveryMethod: 'account_credit', active: true },
      { id: 'pkg4', gameId: 'freefire', gameName: 'Free Fire', packageName: '1060 Diamantes', coinAmount: 1060, coinName: 'Diamantes', pricePoins: 79.90, deliveryMethod: 'account_credit', active: true },
    ],
  },
  {
    id: 'gp2', name: 'Roblox Corporation', apiKey: '', merchantId: '',
    createdAt: '2024-01-15T00:00:00.000Z',
    packages: [
      { id: 'pkg5', gameId: 'roblox', gameName: 'Roblox', packageName: '80 Robux',   coinAmount: 80,   coinName: 'Robux', pricePoins: 7.90,  deliveryMethod: 'redeem_code', active: true },
      { id: 'pkg6', gameId: 'roblox', gameName: 'Roblox', packageName: '400 Robux',  coinAmount: 400,  coinName: 'Robux', pricePoins: 34.90, deliveryMethod: 'redeem_code', active: true },
      { id: 'pkg7', gameId: 'roblox', gameName: 'Roblox', packageName: '800 Robux',  coinAmount: 800,  coinName: 'Robux', pricePoins: 64.90, deliveryMethod: 'redeem_code', active: true },
      { id: 'pkg8', gameId: 'roblox', gameName: 'Roblox', packageName: '2000 Robux', coinAmount: 2000, coinName: 'Robux', pricePoins: 149.90, deliveryMethod: 'redeem_code', active: true },
    ],
  },
  {
    id: 'gp3', name: 'Epic Games', apiKey: '', merchantId: '',
    createdAt: '2024-02-01T00:00:00.000Z',
    packages: [
      { id: 'pkg9',  gameId: 'fortnite', gameName: 'Fortnite', packageName: '1.000 V-Bucks', coinAmount: 1000, coinName: 'V-Bucks', pricePoins: 39.90, deliveryMethod: 'account_credit', active: true },
      { id: 'pkg10', gameId: 'fortnite', gameName: 'Fortnite', packageName: '2.800 V-Bucks', coinAmount: 2800, coinName: 'V-Bucks', pricePoins: 99.90, deliveryMethod: 'account_credit', active: true },
    ],
  },
  {
    id: 'gp4', name: 'Mojang / Microsoft', apiKey: '', merchantId: '',
    createdAt: '2024-02-10T00:00:00.000Z',
    packages: [
      { id: 'pkg11', gameId: 'minecraft', gameName: 'Minecraft', packageName: '320 Minecoins',  coinAmount: 320,  coinName: 'Minecoins', pricePoins: 14.90, deliveryMethod: 'redeem_code', active: true },
      { id: 'pkg12', gameId: 'minecraft', gameName: 'Minecraft', packageName: '720 Minecoins',  coinAmount: 720,  coinName: 'Minecoins', pricePoins: 29.90, deliveryMethod: 'redeem_code', active: true },
      { id: 'pkg13', gameId: 'minecraft', gameName: 'Minecraft', packageName: '1720 Minecoins', coinAmount: 1720, coinName: 'Minecoins', pricePoins: 64.90, deliveryMethod: 'redeem_code', active: true },
    ],
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
    { name: 'pouplay-admin' }
  )
)
