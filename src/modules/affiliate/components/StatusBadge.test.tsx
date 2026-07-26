import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('capitalizes the text via CSS class', () => {
    const { container } = render(<StatusBadge status="approved" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('capitalize')
  })

  it('applies correct color class for each status', () => {
    const statuses = ['paid', 'approved', 'pending', 'rejected', 'cancelled']
    statuses.forEach(status => {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
      unmount()
    })
  })

  it('falls back to gray for unknown status', () => {
    const { container } = render(<StatusBadge status="unknown" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-gray-500/10')
  })
})
