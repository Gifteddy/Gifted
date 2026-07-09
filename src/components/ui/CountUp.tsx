import { useCounter } from '@/hooks/useCounter'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function CountUp({ end, duration, suffix = '', prefix = '', decimals = 0, className }: CountUpProps) {
  const { value, ref } = useCounter(end, duration)
  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}
