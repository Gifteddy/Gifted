import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'

export function ProtectedRoute() {
  const { user, loading, initialized, initialize } = useAdminStore()
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
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
