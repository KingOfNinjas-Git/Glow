import { describe, expect, it } from 'vitest'
import { cycleSeconds, getPreset, phaseAt } from './breathing'

describe('breathing', () => {
  it('has the three presets with the right cycle lengths', () => {
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
})
