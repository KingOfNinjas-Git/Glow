export type PhaseKind = 'inhale' | 'hold' | 'exhale'
export interface Phase {
  kind: PhaseKind
  seconds: number
}
export type PresetId = 'box' | '478' | 'calm'
export interface BreathPreset {
  id: PresetId
  name: string
  pattern: string
  blurb: string
  phases: Phase[]
}

export const PRESETS: BreathPreset[] = [
  {
    id: 'box',
    name: 'Box',
    pattern: '4 · 4 · 4 · 4',
    blurb: 'Even and steady. Great for feeling grounded.',
    phases: [
      { kind: 'inhale', seconds: 4 },
      { kind: 'hold', seconds: 4 },
      { kind: 'exhale', seconds: 4 },
      { kind: 'hold', seconds: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    pattern: '4 · 7 · 8',
    blurb: 'A long exhale that helps you wind down.',
    phases: [
      { kind: 'inhale', seconds: 4 },
      { kind: 'hold', seconds: 7 },
      { kind: 'exhale', seconds: 8 },
    ],
  },
  {
    id: 'calm',
    name: 'Calm',
    pattern: '4 · 6',
    blurb: 'In gently, out slowly. The easy one.',
    phases: [
      { kind: 'inhale', seconds: 4 },
      { kind: 'exhale', seconds: 6 },
    ],
  },
]

export const DURATIONS_MIN = [1, 2, 3] as const

export const PHASE_LABEL: Record<PhaseKind, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
}

export const getPreset = (id: PresetId): BreathPreset => PRESETS.find((p) => p.id === id) ?? PRESETS[0]

export const cycleSeconds = (preset: BreathPreset): number =>
  preset.phases.reduce((sum, p) => sum + p.seconds, 0)

export interface PhaseState {
  index: number
  kind: PhaseKind
  label: string
  /** whole seconds left in this phase (counts down, never below 1 while active) */
  secondsLeft: number
  /** 0..1 through the phase */
  progress: number
  /** circle size 0 (small) .. 1 (full) */
  scale: number
}

/** Where we are in the breathing cycle `elapsedMs` after the session started. */
export function phaseAt(preset: BreathPreset, elapsedMs: number): PhaseState {
  const cycleMs = cycleSeconds(preset) * 1000
  const t = ((Math.max(0, elapsedMs) % cycleMs) + cycleMs) % cycleMs
  let start = 0
  for (let i = 0; i < preset.phases.length; i++) {
    const phase = preset.phases[i]
    const len = phase.seconds * 1000
    if (t < start + len) {
      const progress = (t - start) / len
      let scale: number
      if (phase.kind === 'inhale') scale = progress
      else if (phase.kind === 'exhale') scale = 1 - progress
      else {
        // a hold keeps whatever size the previous phase ended at
        const prev = preset.phases[(i - 1 + preset.phases.length) % preset.phases.length]
        scale = prev.kind === 'inhale' ? 1 : 0
      }
      return {
        index: i,
        kind: phase.kind,
        label: PHASE_LABEL[phase.kind],
        secondsLeft: Math.max(1, Math.ceil((start + len - t) / 1000)),
        progress,
        scale,
      }
    }
    start += len
  }
  return { index: 0, kind: 'inhale', label: PHASE_LABEL.inhale, secondsLeft: preset.phases[0].seconds, progress: 0, scale: 0 }
}
