import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AdminState {
  user: User | null
  loading: boolean
  initialized: boolean
  isAdmin: boolean

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      let isAdmin = false
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        isAdmin = profile?.role === 'admin'
      }
      set({ user, loading: false, initialized: true, isAdmin })

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        let admin = false
        if (u) {
          const { data: p } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', u.id)
            .single()
          admin = p?.role === 'admin'
        }
        set({ user: u, loading: false, isAdmin: admin })
      })
    } catch {
      set({ loading: false, initialized: true, isAdmin: false })
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
    set({ user: null, isAdmin: false })
  },
}))
