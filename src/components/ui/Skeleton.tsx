interface SkeletonProps { className?: string; variant?: 'text' | 'circular' | 'rectangular'; width?: string | number; height?: string | number }

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const base = 'rounded-xl bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 bg-[length:200%_100%] animate-skeleton-shimmer'
  const variants = { text: 'h-4 w-full', circular: 'rounded-full', rectangular: '' }
  return <div className={`${base} ${variants[variant]} ${className}`} style={{ width, height }} />
}
