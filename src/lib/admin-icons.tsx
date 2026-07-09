import { cn } from './utils'

export function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export const Icons = {
  dashboard: (cn?: string) => <Svg className={cn}><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="10" y="2" width="6" height="6" rx="1" /><rect x="2" y="10" width="6" height="6" rx="1" /><rect x="10" y="10" width="6" height="6" rx="1" /></Svg>,
  folder: (cn?: string) => <Svg className={cn}><path d="M2 5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" /></Svg>,
  upload: (cn?: string) => <Svg className={cn}><path d="M9 12V3M5.5 6.5L9 3l3.5 3.5" /><path d="M2 12v2.5A1.5 1.5 0 003.5 16h11a1.5 1.5 0 001.5-1.5V12" /></Svg>,
  cart: (cn?: string) => <Svg className={cn}><path d="M2 3h2l1.5 7.5A1.5 1.5 0 007 12h6.5a1.5 1.5 0 001.4-1l1.6-5.5H6" /><circle cx="7.5" cy="15" r="1.5" /><circle cx="13.5" cy="15" r="1.5" /></Svg>,
  chat: (cn?: string) => <Svg className={cn}><path d="M2 8.5A6.5 6.5 0 018.5 2h1A6.5 6.5 0 0116 8.5v3A1.5 1.5 0 0114.5 13H8.5A6.5 6.5 0 012 8.5z" /><path d="M5.5 7h7M5.5 9.5h4" /></Svg>,
  gear: (cn?: string) => <Svg className={cn}><circle cx="9" cy="9" r="2.5" /><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" /></Svg>,
  play: (cn?: string) => <Svg className={cn}><circle cx="9" cy="9" r="7" /><polygon points="7,5.5 7,12.5 13,9" fill="currentColor" /></Svg>,
  pencil: (cn?: string) => <Svg className={cn}><path d="M13 2.5l2.5 2.5L6 14.5H3.5V12L13 2.5z" /><path d="M11 4l3 3" /></Svg>,
  star: (cn?: string) => <Svg className={cn}><polygon points="9,2 11.5,6.5 16.5,7.2 13,10.5 14,15.5 9,13 4,15.5 5,10.5 1.5,7.2 6.5,6.5" fill="currentColor" /></Svg>,
  tag: (cn?: string) => <Svg className={cn}><path d="M2 9L9 2h7v7l-7 7L2 9z" /><circle cx="12" cy="6" r="1" fill="currentColor" /></Svg>,
  image: (cn?: string) => <Svg className={cn}><rect x="2" y="3.5" width="14" height="11" rx="1.5" /><circle cx="7" cy="8" r="2" /><path d="M16 12.5l-4-5-4 4-2.5-2L2 13" /></Svg>,
  share: (cn?: string) => <Svg className={cn}><circle cx="5" cy="9" r="2.5" /><circle cx="13" cy="5" r="2.5" /><circle cx="13" cy="13" r="2.5" /><path d="M7.5 10.5l3.5 2M7.5 7.5l3.5-2" /></Svg>,
  box: (cn?: string) => <Svg className={cn}><path d="M2 5l7-3 7 3v9l-7 3-7-3V5z" /><path d="M9 7.5l7-3M9 7.5v10.5M9 7.5L2 4.5" /></Svg>,
  clipboard: (cn?: string) => <Svg className={cn}><rect x="4" y="2" width="10" height="14" rx="1.5" /><path d="M6 4.5h6M6 7.5h6M6 10.5h4" /><path d="M7.5 2V.5M10.5 2V.5" /></Svg>,
  receipt: (cn?: string) => <Svg className={cn}><path d="M3 2h12l1 14H2L3 2z" /><path d="M5.5 6.5h7M5.5 9h7M5.5 11.5h4" /></Svg>,
  users: (cn?: string) => <Svg className={cn}><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="5.5" cy="5" r="2" /><path d="M1 16c0-2.5 2-4.5 4.5-4.5" /></Svg>,
  percent: (cn?: string) => <Svg className={cn}><circle cx="5.5" cy="5.5" r="2" /><circle cx="12.5" cy="12.5" r="2" /><path d="M14 4L4 14" /></Svg>,
  handshake: (cn?: string) => <Svg className={cn}><path d="M2 8v4h2l3 3h3l4-3" /><path d="M16 8v4h-2l-3 3H8l-4-3" /><circle cx="9" cy="6" r="2" /></Svg>,
  sliders: (cn?: string) => <Svg className={cn}><line x1="4" y1="9" x2="14" y2="9" /><circle cx="4" cy="9" r="1.5" fill="currentColor" /><circle cx="14" cy="9" r="1.5" fill="currentColor" /><line x1="9" y1="4" x2="9" y2="14" /><circle cx="9" cy="4" r="1.5" fill="currentColor" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /></Svg>,
  mail: (cn?: string) => <Svg className={cn}><rect x="2" y="4" width="14" height="10" rx="1.5" /><path d="M2 5.5l7 5 7-5" /></Svg>,
  chart: (cn?: string) => <Svg className={cn}><rect x="3" y="8" width="3" height="7" rx=".5" /><rect x="7.5" y="5" width="3" height="10" rx=".5" /><rect x="12" y="2" width="3" height="13" rx=".5" /></Svg>,
  link: (cn?: string) => <Svg className={cn}><path d="M7.5 7l3-3a3 3 0 014.2 4.2l-2 2M10.5 11l-3 3a3 3 0 01-4.2-4.2l2-2" /></Svg>,
  home: (cn?: string) => <Svg className={cn}><path d="M2 9l7-6 7 6" /><path d="M4 7.5V15a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V7.5" /></Svg>,
}
