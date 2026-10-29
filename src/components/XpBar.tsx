import { m } from 'framer-motion'
import { useI18n } from '../i18n'
import type { LevelInfo } from '../lib/xp'

export function XpBar({ info }: { info: LevelInfo }) {
  const { t } = useI18n()
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-accent-strong">{t('xp.level', { n: info.level })}</span>
        <span className="text-ink-soft">
          {info.xpIntoLevel} / {info.xpForLevel} XP
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t('xp.progress', { n: info.level })}
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
      <p className="mt-1.5 text-xs text-ink-soft">{t('xp.toGo', { xp: info.xpToGo, next: info.level + 1 })}</p>
    </div>
  )
}
