import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AdminState {
  user: User | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, loading: false, initialized: true })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, loading: false })
      })
    } catch {
      set({ loading: false, initialized: true })
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
    set({ user: null })
  },
}))
