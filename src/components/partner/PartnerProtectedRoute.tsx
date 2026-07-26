import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePartnerStore } from '@/store/partner'

export function PartnerProtectedRoute() {
  const { user, loading, initialized, initialize } = usePartnerStore()
  const location = useLocation()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/shop/partners/dashboard" state={{ from: location }} replace />
  }

  return <Outlet />
}
