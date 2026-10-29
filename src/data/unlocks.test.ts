import { describe, expect, it } from 'vitest'
import { GARDEN_PLANTS, gardenSize, levelForPlant, unlocksAtLevel } from './unlocks'

describe('the garden after the last unlock', () => {
  it('stays closed until level 16, then grows a plant every two levels', () => {
    expect([1, 10, 15].map(gardenSize)).toEqual([0, 0, 0])
    expect([16, 17, 18, 19, 20].map(gardenSize)).toEqual([1, 1, 2, 2, 3])
  })

  it('never has more plants than there are kinds of plants', () => {
    expect(gardenSize(30)).toBe(GARDEN_PLANTS.length)
    expect(gardenSize(500)).toBe(GARDEN_PLANTS.length)
  })

  it('says at which level each plant arrives', () => {
    expect(levelForPlant(1)).toBe(16)
    expect(levelForPlant(2)).toBe(18)
    expect(levelForPlant(8)).toBe(30)
    for (let n = 1; n <= GARDEN_PLANTS.length; n++) expect(gardenSize(levelForPlant(n))).toBe(n)
  })

  it('celebrates a new plant exactly when one arrives', () => {
    const plantsAt = (level: number) => unlocksAtLevel(level).filter((u) => u.kind === 'garden')
    expect(plantsAt(15)).toEqual([])
    expect(plantsAt(16)).toEqual([{ kind: 'garden', id: 1 }])
    expect(plantsAt(17)).toEqual([])
    expect(plantsAt(18)).toEqual([{ kind: 'garden', id: 2 }])
    expect(plantsAt(31)).toEqual([])
  })
})
