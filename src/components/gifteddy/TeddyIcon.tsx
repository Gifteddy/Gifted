export function TeddyIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="27" r="15" fill="currentColor" opacity="0.12" />
      <path d="M15 12a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z"
        fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="11" r="4.5" fill="currentColor" opacity="0.15" />
      <circle cx="31" cy="11" r="4.5" fill="currentColor" opacity="0.15" />
      <circle cx="19" cy="27" r="2" fill="currentColor" />
      <circle cx="29" cy="27" r="2" fill="currentColor" />
      <circle cx="19" cy="27" r="1" fill="white" opacity="0.6" />
      <circle cx="29" cy="27" r="1" fill="white" opacity="0.6" />
      <ellipse cx="24" cy="33" rx="2.5" ry="1.5" fill="currentColor" opacity="0.2" />
      <path d="M24 25v4" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <path d="M21 28c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" fill="none" />
      <circle cx="24" cy="27" r="14.5" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
    </svg>
  )
}
