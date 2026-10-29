import { m } from 'framer-motion'
import { useId } from 'react'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}
    >
      <m.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${checked ? 'right-1' : 'left-1'}`}
      />
    </button>
  )
}

interface SegProps<T extends string | number> {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: SegProps<T>) {
  const group = useId()
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-surface2 p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-4 py-2 text-sm font-bold transition-colors ${active ? 'text-on-accent' : 'text-ink-soft'}`}
          >
            {active && (
              <m.span
                layoutId={`seg-${group}`}
                className="absolute inset-0 rounded-full bg-accent-grad"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
