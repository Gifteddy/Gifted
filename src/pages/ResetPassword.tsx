import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Meta } from '@/lib/meta'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/login'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

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
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('An unexpected error occurred')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4 dark:bg-[#0A0A0F]">
        <Meta title="Password Updated" description="Your Gifted account password has been updated." noindex />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
            <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Password Updated</h1>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-6">Your password has been successfully changed. You can now sign in with your new password.</p>
          <button onClick={() => navigate(returnTo)}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]">
            Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4 dark:bg-[#0A0A0F]">
        <Meta title="Verifying Reset Link" description="Verifying your password reset link." noindex />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4 dark:bg-[#0A0A0F]">
      <Meta title="Set New Password" description="Set a new password for your Gifted account." noindex />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10">
            <svg className="h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold">Set New Password</h1>
          <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">Enter your new password below</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">New Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters" autoComplete="new-password" required
                className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-white/60">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password" autoComplete="new-password" required
                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button type="submit" disabled={loading || !password.trim() || !confirmPassword.trim()}
              className="w-full rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-6">
          <Link to={returnTo} className="text-xs text-brand-500 hover:text-brand-600 transition-colors">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
