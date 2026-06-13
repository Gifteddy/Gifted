import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function silentResolve() {
  return Promise.resolve({ data: null, error: null, count: null })
}

const noopQuery = new Proxy({} as Record<string, unknown>, {
  get(_, prop) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined
    if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete' || prop === 'order' || prop === 'eq' || prop === 'limit' || prop === 'single' || prop === 'range' || prop === 'filter' || prop === 'or' || prop === 'containedBy' || prop === 'contains' || prop === 'textSearch' || prop === 'not' || prop === 'in' || prop === 'gt' || prop === 'gte' || prop === 'lt' || prop === 'lte' || prop === 'neq' || prop === 'is' || prop === 'like' || prop === 'ilike' || prop === 'fts' || prop === 'plfts' || prop === 'phfts' || prop === 'wfts' || prop === 'match' || prop === 'maybeSingle' || prop === 'csv') {
      return () => noopQuery
    }
    return silentResolve
  },
})

const hasCredentials = supabaseUrl && supabaseAnonKey

function createNoopClient() {
  return {
    from: () => noopQuery,
    channel: () => ({
      on: () => ({ subscribe: (cb?: (status: string) => void) => { cb?.('SUBSCRIBED'); return {} } }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: () => ({
        list: () => Promise.resolve({ data: [], error: null }),
        upload: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as ReturnType<typeof createClient>
}

export const supabase = hasCredentials ? createClient(supabaseUrl, supabaseAnonKey) : createNoopClient()
