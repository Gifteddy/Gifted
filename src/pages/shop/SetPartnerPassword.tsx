import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Meta } from '@/lib/meta'

export default function SetPartnerPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token || !email) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F] text-gray-900 dark:text-white/90 flex items-center justify-center p-6">
        <Meta title="Invalid Link - Gifted Partners" description="This setup link is invalid or missing required parameters." />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white/90">Invalid Setup Link</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mb-6">This link is missing required information. Please use the link from your approval email.</p>
          <Link to="/shop/partners/login" className="text-sm text-brand-500 dark:text-brand-400 hover:underline">Go to Partner Login</Link>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || !confirmPassword.trim()) return

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/partner-set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to set password')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F] text-gray-900 dark:text-white/90 flex items-center justify-center p-6">
        <Meta title="Password Set - Gifted Partners" description="Your partner account password has been set successfully." />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
            <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Password Set!</h1>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6">
            Your partner account is ready. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/shop/partners/login')}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]"
          >
            Sign In
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] dark:bg-[#0A0A0F] text-gray-900 dark:text-white/90 flex items-center justify-center p-6">
      <Meta title="Set Password - Gifted Partners" description="Set your password to access the Gifted Partners dashboard." />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white">
            G
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white/90">Set Your Password</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-white/40">Create a password for your partner account</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">{email}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/70">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/70">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password.trim() || !confirmPassword.trim()}
              className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none text-center"
            >
              {loading ? 'Setting Password...' : 'Set Password'}
            </button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/40">
          <Link to="/shop/partners/login" className="font-medium text-brand-500 dark:text-brand-400 hover:underline">
            Back to Partner Login
          </Link>
        </p>
      </div>
    </main>
  )
}
