import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { usePartnerStore } from '@/store/partner'
import { Meta } from '@/lib/meta'

export default function PartnerLogin() {
  const { user, initialized, initialize, signIn } = usePartnerStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (initialized && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/shop/partners/dashboard'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/shop/partners/dashboard'
    navigate(from, { replace: true })
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F] text-gray-900 dark:text-white/90 flex items-center justify-center p-6">
      <Meta title="Partner Login" description="Sign in to your Gifted Partners dashboard." />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white">
            G
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Gifted Partners</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-white/40">Sign in to your partner dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/70">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com" autoComplete="email"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/70">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30" />
            <div className="mt-1.5 text-right">
              <Link to="/forgot-password?returnTo=/shop/partners/login" className="text-xs text-brand-500 dark:text-brand-400 hover:underline">Forgot Password?</Link>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading || !email.trim() || !password.trim()}
            className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none text-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/40">
          Don't have an account?{' '}
          <Link to="/shop/partners/apply" className="font-medium text-brand-500 dark:text-brand-400 hover:underline">Apply Now</Link>
        </p>

        <div className="mt-4 text-center">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to Store
          </Link>
        </div>
      </div>
    </main>
  )
}
