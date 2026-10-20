"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  variantId: string | null
  quantity: number
}

type CartState = {
  items: CartItem[]
  deliveryZoneId: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clear: () => void
  setDeliveryZone: (id: string | null) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryZoneId: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: Math.min(99, item.quantity) }] }
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.max(0, Math.min(99, quantity)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [], deliveryZoneId: null }),
      setDeliveryZone: (id) => set({ deliveryZoneId: id }),
    }),
    { name: "ewurahils-cart" }
  )
)