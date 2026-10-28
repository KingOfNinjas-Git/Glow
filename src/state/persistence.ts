import { STORAGE_KEY } from '../config/app'
import { defaultStorage, readJson, writeJson, type StorageAdapter } from '../lib/storage'
import { createInitialData, type AppData } from './types'

/** Merge whatever was stored over fresh defaults so older/partial saves never crash the app. */
export function normalize(raw: Partial<AppData> | null): AppData {
  const base = createInitialData()
  if (!raw || typeof raw !== 'object') return base
  return {
    ...base,
    ...raw,
    schemaVersion: 1,
    profile: { ...base.profile, ...raw.profile },
    companion: { ...base.companion, ...raw.companion },
    settings: { ...base.settings, ...raw.settings, reminders: raw.settings?.reminders ?? [] },
    habits: raw.habits ?? [],
    completions: raw.completions ?? {},
    xpClaims: raw.xpClaims ?? {},
    checkIns: raw.checkIns ?? {},
    breaths: raw.breaths ?? [],
    xp: Number.isFinite(raw.xp) ? Math.max(0, raw.xp as number) : 0,
  }
}

export function loadAppData(adapter: StorageAdapter = defaultStorage): AppData {
  return normalize(readJson<Partial<AppData>>(adapter, STORAGE_KEY))
}

export function saveAppData(data: AppData, adapter: StorageAdapter = defaultStorage): void {
  writeJson(adapter, STORAGE_KEY, data)
}

export function clearAppData(adapter: StorageAdapter = defaultStorage): void {
  adapter.removeItem(STORAGE_KEY)
}
