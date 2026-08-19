import { create } from 'zustand'

interface CartItem {
  productId: string
  title: string
  price: number
  type: 'digital' | 'physical' | 'bundle'
  thumbnail: string
  quantity: number
  size?: string
  color?: string
  options?: Record<string, string>
}

function cartKey(item: { productId: string; size?: string; color?: string; options?: Record<string, string> }) {
  const optStr = item.options ? JSON.stringify(Object.entries(item.options).sort()) : ''
  return `${item.productId}__${item.size || ''}__${item.color || ''}__${optStr}`
}

export { cartKey }

interface CartState {
  items: CartItem[]
  drawerOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  drawerOpen: false,

  addItem: (item) => set((state) => {
    const key = cartKey(item)
    const existing = state.items.find(i => cartKey(i) === key)
    if (existing) {
      return {
        items: state.items.map(i =>
          cartKey(i) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }
    }
    return { items: [...state.items, { ...item, quantity: 1 }] }
  }),

  removeItem: (key) => set((state) => ({
    items: state.items.filter(i => cartKey(i) !== key),
  })),

  updateQuantity: (key, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter(i => cartKey(i) !== key)
      : state.items.map(i =>
          cartKey(i) === key ? { ...i, quantity } : i
        ),
  })),

  clearCart: () => set({ items: [] }),

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
