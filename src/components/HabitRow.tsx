import { AnimatePresence, motion } from 'framer-motion'
import { useRef } from 'react'
import type { Habit } from '../state/types'

interface Props {
  habit: Habit
  done: boolean
  daysThisMonth: number
  onToggle: (el: Element | null) => void
  onEdit: () => void
}

export function HabitRow({ habit, done, daysThisMonth, onToggle, onEdit }: Props) {
  const check = useRef<HTMLButtonElement>(null)
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`flex items-center gap-3 rounded-3xl border p-3 pr-2 transition-colors ${
        done ? 'border-transparent bg-accent-soft' : 'border-line bg-surface'
      }`}
    >
      <motion.button
        ref={check}
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${habit.name}, ${done ? 'done today' : 'not done yet'}`}
        onClick={() => onToggle(check.current)}
        whileTap={{ scale: 0.85 }}
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-2xl ${
          done ? 'border-transparent bg-accent-grad' : 'border-line bg-surface2'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.svg
              key="check"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-on-accent"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          ) : (
            <motion.span key="emoji" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden="true">
              {habit.emoji}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-base font-bold ${done ? 'text-accent-strong' : ''}`}>{habit.name}</p>
        <p className="text-xs text-ink-soft">
          {daysThisMonth === 0 ? 'Fresh start this month' : `${daysThisMonth} ${daysThisMonth === 1 ? 'day' : 'days'} this month`}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${habit.name}`}
        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-ink-soft hover:bg-surface2"
      >
        ⋯
      </button>
    </motion.li>
  )
}
