import { describe, expect, it } from 'vitest'
import { cycleSeconds, getPreset, PRESETS, phaseAt } from './breathing'

describe('breathing', () => {
  it('has five exercises with the right cycle lengths', () => {
    expect(PRESETS.map((p) => p.id)).toEqual(['box', '478', 'calm', 'coherent', 'sigh'])
    expect(cycleSeconds(getPreset('coherent'))).toBe(10)
    expect(cycleSeconds(getPreset('sigh'))).toBe(9)
    expect(cycleSeconds(getPreset('box'))).toBe(16)
    expect(cycleSeconds(getPreset('478'))).toBe(19)
    expect(cycleSeconds(getPreset('calm'))).toBe(10)
  })
  it('walks through box phases', () => {
    const box = getPreset('box')
    expect(phaseAt(box, 0).label).toBe('Inhale')
    expect(phaseAt(box, 4000).label).toBe('Hold')
    expect(phaseAt(box, 8000).label).toBe('Exhale')
    expect(phaseAt(box, 12000).label).toBe('Hold')
    expect(phaseAt(box, 16000).label).toBe('Inhale')
  })
  it('scales up on inhale, holds, scales down on exhale', () => {
    const box = getPreset('box')
    expect(phaseAt(box, 2000).scale).toBeCloseTo(0.5)
    expect(phaseAt(box, 5000).scale).toBe(1)
    expect(phaseAt(box, 10000).scale).toBeCloseTo(0.5)
    expect(phaseAt(box, 13000).scale).toBe(0)
  })
  it('counts seconds left', () => {
    const calm = getPreset('calm')
    expect(phaseAt(calm, 0).secondsLeft).toBe(4)
    expect(phaseAt(calm, 3500).secondsLeft).toBe(1)
    expect(phaseAt(calm, 4000).secondsLeft).toBe(6)
  })

  it('breathes in evenly and out evenly in the coherent exercise', () => {
    const coherent = getPreset('coherent')
    expect(phaseAt(coherent, 2500).scale).toBeCloseTo(0.5)
    expect(phaseAt(coherent, 5000).label).toBe('Exhale')
    expect(phaseAt(coherent, 7500).scale).toBeCloseTo(0.5)
  })

  it('takes two sips of air for the sigh: up to 70%, then the rest, then a long way down', () => {
    const sigh = getPreset('sigh')
    expect(phaseAt(sigh, 0).scale).toBe(0)
    expect(phaseAt(sigh, 1000).scale).toBeCloseTo(0.35)
    expect(phaseAt(sigh, 2000).index).toBe(1) // the second sip
    expect(phaseAt(sigh, 2000).scale).toBeCloseTo(0.7)
    expect(phaseAt(sigh, 2500).scale).toBeCloseTo(0.85)
    expect(phaseAt(sigh, 3000).label).toBe('Exhale')
    expect(phaseAt(sigh, 3000).scale).toBe(1)
    expect(phaseAt(sigh, 6000).scale).toBeCloseTo(0.5)
    expect(phaseAt(sigh, 9000).index).toBe(0) // and round again
  })

  it('keeps a hold at the size the phase before it ended with', () => {
    const box = getPreset('box')
    expect(phaseAt(box, 5000).scale).toBe(1)
    expect(phaseAt(box, 13000).scale).toBe(0)
  })
})
