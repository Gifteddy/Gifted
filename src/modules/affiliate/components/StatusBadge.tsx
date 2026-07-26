import { cn } from '@/lib/utils'

const colors: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-500',
  approved: 'bg-blue-500/10 text-blue-500',
  pending: 'bg-amber-500/10 text-amber-500',
  rejected: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-gray-500/10 text-gray-500',
}

const dotColors: Record<string, string> = {
  paid: 'bg-green-500',
  approved: 'bg-blue-500',
  pending: 'bg-amber-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full capitalize',
      colors[status] || 'bg-gray-500/10 text-gray-500'
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[status] || 'bg-gray-500')} />
      {status}
    </span>
  )
}
