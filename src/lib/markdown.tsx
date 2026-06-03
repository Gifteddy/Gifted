import type { ReactNode } from 'react'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|\[.*?\]\(.*?\))/)

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue

    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(<strong key={i}>{part.slice(2, -2)}</strong>)
    } else if (part.startsWith('__') && part.endsWith('__')) {
      nodes.push(<strong key={i}>{part.slice(2, -2)}</strong>)
    } else if (part.startsWith('*') && part.endsWith('*')) {
      nodes.push(<em key={i}>{part.slice(1, -1)}</em>)
    } else if (part.startsWith('_') && part.endsWith('_')) {
      nodes.push(<em key={i}>{part.slice(1, -1)}</em>)
    } else if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(<code key={i} className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono">{part.slice(1, -1)}</code>)
    } else if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.+?)\]\((.+?)\)/)
      if (match) {
        nodes.push(<a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-brand-400 underline underline-offset-2">{match[1]}</a>)
      } else {
        nodes.push(escapeHtml(part))
      }
    } else {
      nodes.push(escapeHtml(part))
    }
  }

  return nodes
}

export function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let inList: 'ul' | null = null
  let listItems: ReactNode[] = []

  function flushList() {
    if (inList && listItems.length > 0) {
      elements.push(
        inList === 'ul' ? (
          <ul key={`list-${elements.length}`} className="my-2 list-disc space-y-1 pl-5">{listItems}</ul>
        ) : null,
      )
      listItems = []
      inList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/)
    if (ulMatch) {
      if (inList !== 'ul') flushList()
      inList = 'ul'
      listItems.push(<li key={`li-${i}`}>{parseInline(ulMatch[1])}</li>)
      continue
    }

    flushList()

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5'
      elements.push(<Tag key={i} className={`mt-3 mb-1 font-semibold ${level === 1 ? 'text-base' : 'text-sm'}`}>{parseInline(headingMatch[2])}</Tag>)
      continue
    }

    elements.push(<p key={i} className="my-1">{parseInline(trimmed)}</p>)
  }

  flushList()

  return elements
}
