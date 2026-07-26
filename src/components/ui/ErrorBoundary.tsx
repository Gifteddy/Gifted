import React from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="mb-4 text-4xl">!</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/40">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="rounded-full border border-gray-200 dark:border-white/10 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
