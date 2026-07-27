import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Partner } from '@/modules/partner/types'
import { getPartnerByAuthUserId } from '@/modules/partner/queries'

interface PartnerState {
  user: User | null
  partner: Partner | null
  loading: boolean
  initialized: boolean
  isPartner: boolean

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshPartner: () => Promise<void>
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  user: null,
  partner: null,
  loading: true,
  initialized: false,
  isPartner: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      let partner: Partner | null = null
      if (user) {
        partner = await getPartnerByAuthUserId(user.id)
      }
      set({ user, partner, loading: false, initialized: true, isPartner: !!partner })

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        let p: Partner | null = null
        if (u) {
          p = await getPartnerByAuthUserId(u.id)
        }
        set({ user: u, partner: p, loading: false, isPartner: !!p })
      })
    } catch {
      set({ loading: false, initialized: true, isPartner: false })
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { error: null }
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, partner: null, isPartner: false })
  },

  refreshPartner: async () => {
    const { user } = get()
    if (!user) return
    const partner = await getPartnerByAuthUserId(user.id)
    set({ partner, isPartner: !!partner })
  },
}))
