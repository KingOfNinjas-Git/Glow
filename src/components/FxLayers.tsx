import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { useFx } from '../state/FxContext'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

function FloatingXp() {
  const { floats, removeFloat } = useFx()
  const reduce = !!useReducedMotion()
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <AnimatePresence>
        {floats.map((f) => (
          <m.div
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: reduce ? -10 : -70, scale: [0.7, 1.15, 1, 1] }}
            transition={{ duration: reduce ? 1 : 1.4, times: [0, 0.2, 0.7, 1], ease: 'easeOut' }}
            onAnimationComplete={() => removeFloat(f.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-grad px-3 py-1 text-lg font-extrabold text-on-accent shadow-soft"
            style={{ left: f.x, top: f.y }}
          >
            +{f.amount} XP
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const CONFETTI = ['#ffb89c', '#cdbcff', '#a9e8d0', '#a8d9ff', '#ffb5d0', '#ffe08a']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 340,
        y: -80 - Math.random() * 180,
        r: Math.random() * 360,
        color: CONFETTI[i % CONFETTI.length],
        delay: Math.random() * 0.15,
        round: i % 2 === 0,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute left-1/2 top-24" aria-hidden="true">
      {pieces.map((p) => (
        <m.span
          key={p.id}
          className={`absolute block h-3 w-3 ${p.round ? 'rounded-full' : 'rounded-sm'}`}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function LevelUp() {
  const { levelUp, dismissLevelUp } = useFx()
  const reduce = !!useReducedMotion()
  return (
    <Modal open={!!levelUp} onClose={dismissLevelUp} title="You leveled up!">
      {levelUp && (
        <div className="relative text-center">
          {!reduce && <Confetti />}
          <m.div
            initial={reduce ? false : { scale: 0.3, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full bg-accent-grad text-5xl font-black text-on-accent shadow-soft"
          >
            {levelUp.level}
          </m.div>
          <p className="text-lg font-bold">Level {levelUp.level}, look at you glow ✨</p>
          <p className="mt-1 text-ink-soft">Showing up is the whole game, and you keep doing it.</p>
          {levelUp.unlocks.length > 0 && (
            <ul className="mt-4 space-y-2 text-left">
              {levelUp.unlocks.map((u) => (
                <li key={u.label} className="flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-2.5 font-semibold text-accent-strong">
                  <span aria-hidden="true">{u.kind === 'theme' ? '🎨' : u.kind === 'growth' ? '🌱' : '🎀'}</span>
                  New: {u.label}
                </li>
              ))}
            </ul>
          )}
          <Button className="mt-6 w-full" onClick={dismissLevelUp}>
            Thanks, little plant!
          </Button>
        </div>
      )}
    </Modal>
  )
}

function Toasts() {
  const { toasts, dismissToast } = useFx()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3 safe-top" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} id={t.id} title={t.title} body={t.body} onDone={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ id, title, body, onDone }: { id: number; title: string; body: string; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onDone(id), 9000)
    return () => window.clearTimeout(t)
  }, [id, onDone])
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-3xl border border-line bg-surface p-4 shadow-soft"
    >
      <div className="flex-1">
        <p className="font-extrabold">{title}</p>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      <button className="rounded-full px-2 py-1 text-sm font-bold text-ink-soft" onClick={() => onDone(id)} aria-label="Dismiss reminder">
        ✕
      </button>
    </m.div>
  )
}

export function FxLayers() {
  return (
    <>
      <FloatingXp />
      <LevelUp />
      <Toasts />
    </>
  )
}
