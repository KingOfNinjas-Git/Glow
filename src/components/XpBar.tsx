import { m } from 'framer-motion'
import type { LevelInfo } from '../lib/xp'

export function XpBar({ info }: { info: LevelInfo }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-accent-strong">Level {info.level}</span>
        <span className="text-ink-soft">
          {info.xpIntoLevel} / {info.xpForLevel} XP
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Level ${info.level} progress`}
        aria-valuemin={0}
        aria-valuemax={info.xpForLevel}
        aria-valuenow={info.xpIntoLevel}
        className="h-4 overflow-hidden rounded-full bg-surface2"
      >
        <m.div
          className="h-full rounded-full bg-accent-grad"
          initial={false}
          animate={{ width: `${Math.max(info.progress * 100, info.xpIntoLevel > 0 ? 4 : 0)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">{info.xpToGo} XP to level {info.level + 1}</p>
    </div>
  )
}
