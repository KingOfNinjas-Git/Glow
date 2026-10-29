import { useI18n } from '../i18n'
import { MAX_SAMPLE_LEVEL, useApp } from '../state/AppContext'
import { Button } from './ui/Button'

/**
 * Shown on every screen while the app holds the made-up sample data: says so plainly, lets a visitor jump
 * to any level to see everything it unlocks, and offers a clean start of their own.
 */
export function SampleBar() {
  const app = useApp()
  const { t } = useI18n()
  if (!app.data.sample) return null
  const level = app.level.level

  const step = 'flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg font-black disabled:opacity-40'

  return (
    <section aria-label={t('sample.region')} className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-accent-soft px-4 py-3 text-sm">
      <p className="min-w-0 flex-1 basis-64 text-ink">
        <strong>{t('sample.lead')}</strong> {t('sample.short')}
        <span className="hidden sm:inline">{t('sample.extra')}</span>.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-ink-soft" id="sample-level-label">
          {t('sample.jump')}
        </span>
        <div role="group" aria-labelledby="sample-level-label" className="flex items-center gap-1">
          <button type="button" className={step} aria-label={t('sample.lower')} disabled={level <= 1} onClick={() => app.setSampleLevel(level - 1)}>
            −
          </button>
          <output className="min-w-8 text-center text-base font-black" aria-live="polite">
            {level}
          </output>
          <button type="button" className={step} aria-label={t('sample.raise')} disabled={level >= MAX_SAMPLE_LEVEL} onClick={() => app.setSampleLevel(level + 1)}>
            +
          </button>
        </div>
        <Button variant="soft" onClick={() => app.resetAll()}>
          {t('sample.fresh')}
        </Button>
      </div>
    </section>
  )
}
