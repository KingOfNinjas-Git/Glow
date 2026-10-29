import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { STORAGE_KEY } from '../config/app'
import { toDateKey } from '../lib/dates'
import { applyXp, getLevelInfo, totalXpForLevel, type LevelInfo } from '../lib/xp'
import { createSampleData, type SampleText } from '../lib/sample'
import { unlocksAtLevel, type PaletteId } from '../data/unlocks'
import type { Mood } from '../data/content'
import type { PresetId } from '../lib/breathing'
import * as A from './actions'
import { clearAppData, loadAppData, saveAppData } from './persistence'
import { originOf, useFx, type Origin } from './FxContext'
import { createInitialData, type AppData, type Reminder, type Settings } from './types'
import { useToday } from '../hooks/useToday'

export interface AppApi {
  data: AppData
  today: string
  level: LevelInfo
  toggleHabit: (id: string, source?: Element | null) => void
  addHabit: (emoji: string, name: string, days?: number[]) => void
  updateHabit: (id: string, emoji: string, name: string, days?: number[]) => void
  deleteHabit: (id: string) => void
  saveCheckIn: (mood: Mood, note: string, source?: Element | null) => void
  completeBreathing: (presetId: PresetId, seconds: number, source?: Element | null) => void
  finishOnboarding: (name: string, habits: { emoji: string; name: string }[]) => void
  setProfileName: (name: string) => void
  setCompanionName: (name: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  addReminder: (time: string) => void
  updateReminder: (id: string, patch: Partial<Reminder>) => void
  removeReminder: (id: string) => void
  markReminderFired: (id: string) => void
  resetAll: () => void
  /** Replace everything with the data from a backup (already checked by parseBackup). */
  restoreAll: (data: AppData) => void
  /** Fill the app with made-up history so every screen has something to show (in the given language). */
  loadSample: (text?: SampleText) => void
  /** While exploring sample data only: jump to a level to see what it unlocks. */
  setSampleLevel: (level: number) => void
  /** Try a theme before it is unlocked. Only changes how the app looks, never the data. */
  previewPalette: PaletteId | null
  setPreviewPalette: (palette: PaletteId | null) => void
}

export const MAX_SAMPLE_LEVEL = 30

const AppContext = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const ref = useRef(data)
  const [previewPalette, setPreviewPalette] = useState<PaletteId | null>(null)
  const fx = useFx()
  const today = useToday()

  useEffect(() => {
    saveAppData(data)
  }, [data])

  // The same data can be open in two places at once (the browser tab and the installed app). When the other
  // one saves, take its version instead of overwriting it with ours on the next change.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return
      const next = loadAppData()
      ref.current = next
      setData(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Commit a pure transition, then fire the feel-good effects (floating XP, level-up). */
  const commit = useCallback(
    (result: A.ActionResult, origin?: Origin) => {
      const prev = ref.current
      ref.current = result.state
      setData(result.state)
      if (result.xp > 0) {
        fx.floatXp(result.xp, origin)
        const gain = applyXp(prev.xp, result.xp)
        if (gain.levelsGained.length) {
          const level = gain.after.level
          fx.celebrate({ level, unlocks: gain.levelsGained.flatMap(unlocksAtLevel) })
        }
      }
    },
    [fx],
  )
  const set = useCallback((next: AppData) => commit({ state: next, xp: 0 }), [commit])

  const api = useMemo<AppApi>(
    () => ({
      data,
      today,
      level: getLevelInfo(data.xp),
      toggleHabit: (id, source) => commit(A.toggleHabit(ref.current, id, toDateKey()), originOf(source)),
      addHabit: (emoji, name, days) => set(A.addHabit(ref.current, emoji, name, new Date(), days)),
      updateHabit: (id, emoji, name, days) => set(A.updateHabit(ref.current, id, emoji, name, days)),
      deleteHabit: (id) => set(A.deleteHabit(ref.current, id)),
      saveCheckIn: (mood, note, source) => commit(A.saveCheckIn(ref.current, toDateKey(), mood, note), originOf(source)),
      completeBreathing: (presetId, seconds, source) =>
        commit(A.completeBreathing(ref.current, toDateKey(), presetId, seconds), originOf(source)),
      finishOnboarding: (name, habits) => set(A.finishOnboarding(ref.current, name, habits)),
      setProfileName: (name) => set(A.setProfileName(ref.current, name)),
      setCompanionName: (name) => set(A.setCompanionName(ref.current, name)),
      updateSettings: (patch) => set(A.updateSettings(ref.current, patch)),
      addReminder: (time) => set(A.addReminder(ref.current, time)),
      updateReminder: (id, patch) => set(A.updateReminder(ref.current, id, patch)),
      removeReminder: (id) => set(A.removeReminder(ref.current, id)),
      markReminderFired: (id) => set(A.updateReminder(ref.current, id, { lastFired: toDateKey() })),
      resetAll: () => {
        clearAppData()
        const fresh = createInitialData()
        set({ ...fresh, settings: { ...fresh.settings, language: ref.current.settings.language } })
      },
      restoreAll: (restored) => set(restored),
      // the person's language choice is kept when the data is replaced
      loadSample: (text) => {
        const sample = createSampleData(new Date(), text)
        set({ ...sample, settings: { ...sample.settings, language: ref.current.settings.language } })
      },
      setSampleLevel: (lvl) => {
        if (!ref.current.sample) return
        const level = Math.max(1, Math.min(MAX_SAMPLE_LEVEL, Math.round(lvl)))
        set({ ...ref.current, xp: totalXpForLevel(level) })
      },
      previewPalette,
      setPreviewPalette,
    }),
    [data, today, commit, set, previewPalette],
  )

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
