import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Bottom sheet on phones, centered card on larger screens. Esc / backdrop closes. */
export function Modal({ open, onClose, title, children }: Props) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#1c1827]/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }} // a closing box must not catch the next click
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-surface p-6 shadow-soft outline-none sm:rounded-[2rem]"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <h2 id={titleId} className="mb-4 text-xl font-extrabold">
              {title}
            </h2>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
