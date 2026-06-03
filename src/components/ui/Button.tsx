import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ children, variant = 'primary', size = 'md', className = '', href, onClick, type = 'button', disabled = false }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl cursor-pointer'
  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2.5',
    lg: 'px-8 py-4 text-lg gap-3',
  }
  const variants: Record<string, string> = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30',
    secondary: 'bg-white/10 dark:bg-white/5 text-text-light dark:text-text-dark backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10',
    ghost: 'text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5',
  }

  if (href) return <a href={href} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</a>

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
