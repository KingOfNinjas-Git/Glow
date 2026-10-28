import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toDateKey } from '../lib/dates'
import { applyXp, getLevelInfo, type LevelInfo } from '../lib/xp'
import { unlocksAtLevel } from '../data/unlocks'
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
  addHabit: (emoji: string, name: string) => void
  updateHabit: (id: string, emoji: string, name: string) => void
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
}

const AppContext = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const ref = useRef(data)
  const fx = useFx()
  const today = useToday()

  useEffect(() => {
    saveAppData(data)
  }, [data])

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
      addHabit: (emoji, name) => set(A.addHabit(ref.current, emoji, name)),
      updateHabit: (id, emoji, name) => set(A.updateHabit(ref.current, id, emoji, name)),
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
        set(createInitialData())
      },
    }),
    [data, today, commit, set],
  )

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
