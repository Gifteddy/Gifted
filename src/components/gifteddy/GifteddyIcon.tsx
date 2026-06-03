export function GifteddyIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="10" width="36" height="26" rx="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M14 34L10 40H38L34 34" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <circle cx="18" cy="23" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="23" r="2.5" fill="currentColor" opacity="0.6" />
      <path d="M18 23 L30 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
    </svg>
  )
}
