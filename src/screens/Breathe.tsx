import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { BreathCircle } from '../components/BreathCircle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Segmented } from '../components/ui/Controls'
import { DURATIONS_MIN, PRESETS, getPreset, type PresetId } from '../lib/breathing'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

type Stage = 'setup' | 'running' | 'done' | 'stopped'

export function Breathe() {
  const app = useApp()
  const [presetId, setPresetId] = useState<PresetId>('calm')
  const [minutes, setMinutes] = useState<number>(1)
  const [stage, setStage] = useState<Stage>('setup')
  const awarded = useRef(false)
  const doneButton = useRef<HTMLButtonElement>(null)
  const preset = getPreset(presetId)

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
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Breathe</h1>
        <p className="mt-1 text-ink-soft">A few slow breaths. Nothing to get right.</p>
      </header>

      {stage === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div role="radiogroup" aria-label="Breathing style" className="grid gap-3">
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
                    <span className="text-lg font-extrabold">{p.name}</span>
                    <span className={`font-mono text-sm font-bold ${active ? 'text-accent-strong' : 'text-ink-soft'}`}>{p.pattern}</span>
                  </div>
                  <p className="text-sm text-ink-soft">{p.blurb}</p>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Session length"
              value={minutes}
              onChange={setMinutes}
              options={DURATIONS_MIN.map((m) => ({ value: m, label: `${m} min` }))}
            />
            <Button size="lg" onClick={start}>
              Begin · +{XP_REWARDS.breathing} XP
            </Button>
          </div>
        </motion.div>
      )}

      {stage === 'running' && (
        <Card className="flex flex-col items-center gap-4 py-8">
          <BreathCircle preset={preset} totalSeconds={minutes * 60} onFinish={finish} />
          <Button variant="ghost" onClick={() => setStage('stopped')}>
            Stop here
          </Button>
        </Card>
      )}

      {stage === 'stopped' && (
        <Card className="space-y-4 py-8 text-center">
          <p className="text-5xl" aria-hidden="true">🌿</p>
          <h2 className="text-2xl font-extrabold">That’s okay.</h2>
          <p className="text-ink-soft">Even a few breaths help. Come back whenever it feels right.</p>
          <Button onClick={() => setStage('setup')}>Back</Button>
        </Card>
      )}

      {stage === 'done' && (
        <Card className="space-y-4 bg-gradient-to-b from-accent-soft to-surface py-10 text-center">
          <motion.p
            className="text-6xl"
            aria-hidden="true"
            initial={{ scale: 0.4, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          >
            🌸
          </motion.p>
          <h2 className="text-2xl font-extrabold">Nicely done.</h2>
          <p className="mx-auto max-w-xs text-ink-soft">
            You gave yourself {minutes} {minutes === 1 ? 'minute' : 'minutes'} of calm. Notice how your shoulders feel.
          </p>
          <p className="font-bold text-accent-strong">+{XP_REWARDS.breathing} XP</p>
          <div className="flex justify-center gap-2 pt-2">
            <Button ref={doneButton} variant="soft" onClick={() => setStage('setup')}>
              Again
            </Button>
            <Button onClick={() => (window.location.hash = '#/home')}>Back home</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
