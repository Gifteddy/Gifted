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

const FETCH_TIMEOUT_MS = 30000

function withTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const signal = init?.signal
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer)
      return Promise.reject(signal.reason)
    }
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      controller.abort()
    }, { once: true })
  }
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

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

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: withTimeout } })
  : createNoopClient()
