import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6 ${className}`} {...rest} />
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-xl font-extrabold tracking-tight">{children}</h2>
      {hint && <span className="text-sm text-ink-soft">{hint}</span>}
    </div>
  )
}
