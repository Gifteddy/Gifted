interface QuickAction {
  label: string
  action: string
}

const quickActions: QuickAction[] = [
  { label: 'Tell me about Gifted', action: 'Tell me about Gifted' },
  { label: 'Photography', action: 'Show me photography projects' },
  { label: 'Video Production', action: 'Show me video production work' },
  { label: 'Graphic Design', action: 'Show me graphic design projects' },
  { label: 'Development', action: 'Show me development projects' },
  { label: 'Contact Gifted', action: 'How can I contact Gifted?' },
  { label: 'Latest Projects', action: 'Show me the latest projects' },
]

interface QuickActionsProps {
  onSelect: (action: string) => void
  isDark?: boolean
}

export function QuickActions({ onSelect, isDark }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {quickActions.map((qa) => (
        <button
          key={qa.label}
          onClick={() => onSelect(qa.action)}
          className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(146,51,255,0.4)' : 'rgba(119,0,255,0.3)'
            e.currentTarget.style.color = isDark ? '#ad66ff' : '#7700ff'
            e.currentTarget.style.background = isDark ? 'rgba(146,51,255,0.10)' : 'rgba(119,0,255,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'
            e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {qa.label}
        </button>
      ))}
    </div>
  )
}

export { quickActions }
