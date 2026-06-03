import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'

export default function AdminLogin() {
  const { user, initialized, initialize, signIn } = useAdminStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    const result = await signIn(email, password)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4 dark:bg-[#0A0A0F]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7700ff] text-lg font-bold text-white dark:bg-[#9233ff]">A</div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-white/40">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 admin-glass-strong space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/70">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gifted.com" autoComplete="email"
              className="w-full admin-input" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/70">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full admin-input" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading || !email.trim() || !password.trim()}
            className="w-full admin-btn-primary text-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
