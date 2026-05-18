import { PropsWithChildren } from 'react'

interface StatusPillProps extends PropsWithChildren {
  tone?: 'neutral' | 'good' | 'warn'
}

export function StatusPill({ tone = 'neutral', children }: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>
}
