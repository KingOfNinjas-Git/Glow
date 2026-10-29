import { m } from 'framer-motion'
import { useRef, useState } from 'react'
import { BreathCircle } from '../components/BreathCircle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Segmented } from '../components/ui/Controls'
import { useWakeLock } from '../hooks/useWakeLock'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { DURATIONS_MIN, PRESETS, getPreset, type PresetId } from '../lib/breathing'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

type Stage = 'setup' | 'running' | 'done' | 'stopped'

export function Breathe() {
  const app = useApp()
  const { t, tn } = useI18n()
  const [presetId, setPresetId] = useState<PresetId>('calm')
  const [minutes, setMinutes] = useState<number>(1)
  const [stage, setStage] = useState<Stage>('setup')
  const awarded = useRef(false)
  const doneButton = useRef<HTMLButtonElement>(null)
  const preset = getPreset(presetId)
  useWakeLock(stage === 'running') // the phone should not lock in the middle of a session

  const start = () => {
    awarded.current = false
    setStage('running')
  }

  const finish = () => {
    if (awarded.current) return
    awarded.current = true
    setStage('done')
    // award after the done screen mounts so the +XP floats from a visible spot
    window.setTimeout(() => app.completeBreathing(presetId, minutes * 60, doneButton.current), 350)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('breathe.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('breathe.sub')}</p>
      </header>

      {stage === 'setup' && (
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div role="radiogroup" aria-label={t('breathe.style')} className="grid gap-3">
            {PRESETS.map((p) => {
              const active = p.id === presetId
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-3xl border-2 p-4 text-left transition-colors ${
                    active ? 'border-accent-strong bg-accent-soft' : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-extrabold">{t(`breathe.preset.${p.id}.name` as MessageKey)}</span>
                    <span className={`font-mono text-sm font-bold ${active ? 'text-accent-strong' : 'text-ink-soft'}`}>{p.pattern}</span>
                  </div>
                  <p className="text-sm text-ink-soft">{t(`breathe.preset.${p.id}.blurb` as MessageKey)}</p>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label={t('breathe.length')}
              value={minutes}
              onChange={setMinutes}
              options={DURATIONS_MIN.map((minute) => ({ value: minute, label: t('breathe.min', { n: minute }) }))}
            />
            <Button size="lg" onClick={start}>
              {t('breathe.begin', { xp: XP_REWARDS.breathing })}
            </Button>
          </div>
        </m.div>
      )}

      {stage === 'running' && (
        <Card className="flex flex-col items-center gap-4 py-8">
          <BreathCircle preset={preset} totalSeconds={minutes * 60} haptics={app.data.settings.haptics} onFinish={finish} />
          <Button variant="ghost" onClick={() => setStage('stopped')}>
            {t('breathe.stop')}
          </Button>
        </Card>
      )}

      {stage === 'stopped' && (
        <Card className="space-y-4 py-8 text-center">
          <p className="text-5xl" aria-hidden="true">🌿</p>
          <h2 className="text-2xl font-extrabold">{t('breathe.stopped.title')}</h2>
          <p className="text-ink-soft">{t('breathe.stopped.text')}</p>
          <Button onClick={() => setStage('setup')}>{t('common.back')}</Button>
        </Card>
      )}

      {stage === 'done' && (
        <Card className="space-y-4 bg-gradient-to-b from-accent-soft to-surface py-10 text-center">
          <m.p
            className="text-6xl"
            aria-hidden="true"
            initial={{ scale: 0.4, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          >
            🌸
          </m.p>
          <h2 className="text-2xl font-extrabold">{t('breathe.done.title')}</h2>
          <p className="mx-auto max-w-xs text-ink-soft">{tn('breathe.done.text', minutes)}</p>
          <p className="font-bold text-accent-strong">{t('breathe.xp', { xp: XP_REWARDS.breathing })}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Button ref={doneButton} variant="soft" onClick={() => setStage('setup')}>
              {t('breathe.again')}
            </Button>
            <Button onClick={() => (window.location.hash = '#/home')}>{t('breathe.home')}</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
