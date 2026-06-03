interface SkeletonProps { className?: string; variant?: 'text' | 'circular' | 'rectangular'; width?: string | number; height?: string | number }

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const base = 'animate-pulse rounded-xl bg-black/5 dark:bg-white/5'
  const variants = { text: 'h-4 w-full', circular: 'rounded-full', rectangular: '' }
  return <div className={`${base} ${variants[variant]} ${className}`} style={{ width, height }} />
}
