export function GifteddyMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="12" y="14" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="8" width="32" height="26" rx="6" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.12" />
      <circle cx="19" cy="21" r="2.5" fill="currentColor" />
      <circle cx="29" cy="21" r="2.5" fill="currentColor" />
      <path d="M18 29 Q24 33 30 29" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="20" y="34" width="8" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" />
      <path d="M14 38 Q14 44 16 44 L32 44 Q34 44 34 38" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.06" />
    </svg>
  )
}
