import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { phaseAt, type BreathPreset, type PhaseState } from '../lib/breathing'

interface Props {
  preset: BreathPreset
  totalSeconds: number
  onFinish: () => void
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Animated breathing circle. Drives itself from a clock so it never drifts from the phase text. */
export function BreathCircle({ preset, totalSeconds, onFinish }: Props) {
  const reduce = !!useReducedMotion()
  const scale = useMotionValue(0.5)
  const ringOffset = useMotionValue(0)
  const [phase, setPhase] = useState<PhaseState>(() => phaseAt(preset, 0))
  const [remaining, setRemaining] = useState(totalSeconds)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    let last = ''
    let done = false
    const frame = (now: number) => {
      const elapsed = now - start
      const total = totalSeconds * 1000
      if (elapsed >= total && !done) {
        done = true
        finishRef.current()
        return
      }
      const p = phaseAt(preset, elapsed)
      scale.set(reduce ? 0.8 : 0.5 + 0.5 * smooth(p.scale))
      ringOffset.set(1 - Math.min(1, elapsed / total))
      const key = `${p.index}:${p.secondsLeft}`
      if (key !== last) {
        last = key
        setPhase(p)
        setRemaining(Math.max(0, Math.ceil((total - elapsed) / 1000)))
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [preset, totalSeconds, reduce, scale, ringOffset])

  const dash = useTransform(ringOffset, (v) => `${v * 100} 100`)
  const mins = Math.floor(remaining / 60)
  const secs = String(remaining % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--line)" strokeWidth="0.8" />
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="var(--accent-strong)"
            strokeWidth="0.8"
            strokeLinecap="round"
            pathLength={100}
            style={{ strokeDasharray: dash }}
          />
        </svg>
        <motion.div
          style={{ scale }}
          className="flex h-60 w-60 items-center justify-center rounded-full bg-accent-grad shadow-soft sm:h-64 sm:w-64"
        >
          <div className="text-center text-on-accent">
            <p className="text-3xl font-black" aria-hidden="true">
              {phase.label}
            </p>
            <p className="text-lg font-bold opacity-80" aria-hidden="true">
              {phase.secondsLeft}
            </p>
          </div>
        </motion.div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {phase.label}
      </p>
      <p className="text-ink-soft" aria-label={`${mins} minutes ${secs} seconds left`}>
        {mins}:{secs} left
      </p>
    </div>
  )
}
