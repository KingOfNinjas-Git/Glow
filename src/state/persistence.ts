import { STORAGE_KEY } from '../config/app'
import { normalizeDays } from '../lib/habits'
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
    // a habit's weekdays are cleaned (a damaged or hand-edited file cannot leave a habit that is never due)
    habits: (raw.habits ?? []).map(({ days, ...habit }) => {
      const clean = normalizeDays(days)
      return clean ? { ...habit, days: clean } : habit
    }),
    completions: raw.completions ?? {},
    xpClaims: raw.xpClaims ?? {},
    checkIns: raw.checkIns ?? {},
    breaths: raw.breaths ?? [],
    xp: Number.isFinite(raw.xp) ? Math.max(0, raw.xp as number) : 0,
  }
}

/** Why a file was refused. The screen turns the code into a friendly sentence in the right language (restore.err.<code>). */
export type RestoreError = 'toobig' | 'unreadable' | 'notbackup' | 'wrongshape'

export type BackupResult = { ok: true; data: AppData } | { ok: false; error: RestoreError }

/** Largest backup file we will read; a real one is a few hundred KB even after years of use. */
export const MAX_BACKUP_BYTES = 5_000_000

/**
 * Reads the text of a backup file made by "Download a backup". Anything that is not clearly a Glow
 * backup is refused with a friendly message, and what is accepted goes through `normalize`, so a
 * damaged or older file can never crash the app or leave it half-filled.
 */
export function parseBackup(text: string): BackupResult {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'toobig' }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'unreadable' }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'notbackup' }
  const r = raw as Record<string, unknown>
  const looksRight =
    typeof r.xp === 'number' && Array.isArray(r.habits) && !!r.profile && typeof r.profile === 'object' && typeof r.completions === 'object'
  if (!looksRight) return { ok: false, error: 'wrongshape' }
  const data = normalize(r as Partial<AppData>)
  // A backup always comes from someone who finished onboarding; never send them back to the welcome screen.
  return { ok: true, data: { ...data, profile: { ...data.profile, onboarded: true } } }
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
