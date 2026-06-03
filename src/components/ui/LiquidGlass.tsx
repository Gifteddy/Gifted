import { type ReactNode } from 'react'
import { useTheme } from '@/store/theme'

interface LiquidGlassProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'nav' | 'aside'
  intensity?: 'subtle' | 'medium' | 'pronounced'
  noBorder?: boolean
}

const intensityMap = {
  subtle: { bg: 'rgba(255,255,255,0.04)', bgDark: 'rgba(10,10,15,0.6)', blur: '16px', saturate: '1.2' },
  medium: { bg: 'rgba(255,255,255,0.08)', bgDark: 'rgba(10,10,15,0.75)', blur: '24px', saturate: '1.4' },
  pronounced: { bg: 'rgba(255,255,255,0.12)', bgDark: 'rgba(10,10,15,0.85)', blur: '32px', saturate: '1.6' },
}

export function LiquidGlass({ children, className = '', as: Tag = 'div', intensity = 'medium', noBorder = false }: LiquidGlassProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const config = intensityMap[intensity]

  return (
    <Tag
      className={className}
      style={{
        background: isDark ? config.bgDark : config.bg,
        backdropFilter: `blur(${config.blur}) saturate(${config.saturate})`,
        WebkitBackdropFilter: `blur(${config.blur}) saturate(${config.saturate})`,
        border: noBorder ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'}`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(180deg, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.25)'} 0%, transparent 50%)`,
          borderRadius: 'inherit',
        }}
      />
      {children}
    </Tag>
  )
}
