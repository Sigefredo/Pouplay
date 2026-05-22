import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type OrderStatus = 'pending' | 'delivered' | 'failed'

export interface GameOrder {
  id: string
  userId: string
  userName: string
  gameId: string
  gameName: string
  packageId: string
  packageLabel: string     // "310 Diamantes" or "R$ 25,00"
  pricePoins: number
  deliveryMethod: 'code' | 'account_credit'
  gameUid?: string         // UID in-game — required for account_credit
  status: OrderStatus
  code?: string            // filled by admin on delivery
  redeemUrl?: string
  supplierCost?: number    // R$ paid to supplier (filled by admin)
  supplierName?: string
  createdAt: string
  deliveredAt?: string
}

interface OrderState {
  orders: GameOrder[]
  createOrder: (order: Omit<GameOrder, 'id' | 'createdAt' | 'status'>) => string
  fulfillOrder: (id: string, opts: { code?: string; supplierCost?: number; supplierName?: string }) => void
  failOrder: (id: string) => void
  pendingOrders: () => GameOrder[]
  ordersForUser: (userId: string) => GameOrder[]
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (order) => {
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
        const id = `ORD-${Date.now()}-${rand}`
        set(s => ({ orders: [{ ...order, id, status: 'pending', createdAt: new Date().toISOString() }, ...s.orders] }))
        return id
      },

      fulfillOrder: (id, { code, supplierCost, supplierName }) => {
        set(s => ({
          orders: s.orders.map(o =>
            o.id === id
              ? { ...o, status: 'delivered', code, supplierCost, supplierName, deliveredAt: new Date().toISOString() }
              : o
          ),
        }))
      },

      failOrder: (id) => {
        set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status: 'failed' } : o) }))
      },

      pendingOrders: () => get().orders.filter(o => o.status === 'pending'),

      ordersForUser: (userId) => get().orders.filter(o => o.userId === userId),
    }),
    {
      name: 'pouplay-orders',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
