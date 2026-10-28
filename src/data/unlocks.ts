export type PaletteId = 'peach' | 'lavender' | 'mint' | 'sky' | 'rose' | 'aurora'

export interface PaletteInfo {
  id: PaletteId
  name: string
  unlockLevel: number
  /** swatch used in pickers */
  swatch: [string, string]
}

export const PALETTES: PaletteInfo[] = [
  { id: 'peach', name: 'Peach Fuzz', unlockLevel: 1, swatch: ['#ffb89c', '#ffd3a8'] },
  { id: 'lavender', name: 'Lavender Haze', unlockLevel: 2, swatch: ['#cdbcff', '#e5b8ff'] },
  { id: 'mint', name: 'Mint Tea', unlockLevel: 4, swatch: ['#a9e8d0', '#b8f0ff'] },
  { id: 'sky', name: 'Sky Soda', unlockLevel: 6, swatch: ['#a8d9ff', '#c9c6ff'] },
  { id: 'rose', name: 'Rosé', unlockLevel: 9, swatch: ['#ffb5d0', '#ffd3b0'] },
  { id: 'aurora', name: 'Aurora', unlockLevel: 13, swatch: ['#ffc8dd', '#a8d9ff'] },
]

export type AccessoryId = 'blush' | 'sparkles' | 'bow' | 'shades' | 'crown'

export interface AccessoryInfo {
  id: AccessoryId
  name: string
  unlockLevel: number
}

export const ACCESSORIES: AccessoryInfo[] = [
  { id: 'blush', name: 'Rosy cheeks', unlockLevel: 3 },
  { id: 'sparkles', name: 'Sparkles', unlockLevel: 5 },
  { id: 'bow', name: 'Little bow', unlockLevel: 8 },
  { id: 'shades', name: 'Cool shades', unlockLevel: 11 },
  { id: 'crown', name: 'Tiny crown', unlockLevel: 15 },
]

/** Growth stages, 1 (seed) to 6 (in bloom). */
export const STAGES: { stage: number; name: string; unlockLevel: number }[] = [
  { stage: 1, name: 'Seed', unlockLevel: 1 },
  { stage: 2, name: 'Sprout', unlockLevel: 2 },
  { stage: 3, name: 'Seedling', unlockLevel: 4 },
  { stage: 4, name: 'Leafy', unlockLevel: 7 },
  { stage: 5, name: 'Budding', unlockLevel: 10 },
  { stage: 6, name: 'In bloom', unlockLevel: 14 },
]

export const stageForLevel = (level: number) =>
  [...STAGES].reverse().find((s) => level >= s.unlockLevel) ?? STAGES[0]

export const accessoriesForLevel = (level: number): AccessoryId[] =>
  ACCESSORIES.filter((a) => level >= a.unlockLevel).map((a) => a.id)

export const isPaletteUnlocked = (id: PaletteId, level: number): boolean =>
  level >= (PALETTES.find((p) => p.id === id)?.unlockLevel ?? 1)

export interface Unlock {
  kind: 'theme' | 'growth' | 'accessory'
  label: string
}

/** What reaching `level` newly unlocks (for the celebration). */
export function unlocksAtLevel(level: number): Unlock[] {
  const out: Unlock[] = []
  for (const p of PALETTES) if (p.unlockLevel === level && level > 1) out.push({ kind: 'theme', label: `${p.name} theme` })
  for (const s of STAGES) if (s.unlockLevel === level && level > 1) out.push({ kind: 'growth', label: `Your companion grew: ${s.name}` })
  for (const a of ACCESSORIES) if (a.unlockLevel === level) out.push({ kind: 'accessory', label: a.name })
  return out
}
