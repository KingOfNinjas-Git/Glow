import { APP_NAME } from '../config/app'
import type { AppData } from '../state/types'

/** Ask for a backup when the last one is older than this (or, if there never was one, the data is). */
export const BACKUP_NUDGE_AFTER_DAYS = 14
/** Do not nag anyone who has barely started: a few days of tiny habits is not worth a backup yet. */
export const BACKUP_NUDGE_MIN_XP = 100

const daysBetween = (from: string, to: Date): number => (to.getTime() - new Date(from).getTime()) / 86_400_000

/** True when it is worth gently suggesting a backup. Never for the made-up sample data. */
export function needsBackupNudge(data: AppData, now: Date = new Date()): boolean {
  if (data.sample || !data.profile.onboarded || data.xp < BACKUP_NUDGE_MIN_XP) return false
  const since = data.settings.lastBackupAt ?? data.profile.createdAt
  const days = daysBetween(since, now)
  return Number.isFinite(days) && days >= BACKUP_NUDGE_AFTER_DAYS
}

/** "never", "today", "yesterday", "5 days ago": for the line under the backup button. */
export function describeLastBackup(lastBackupAt: string | undefined, now: Date = new Date()): string {
  if (!lastBackupAt) return 'never'
  const days = Math.floor(daysBetween(lastBackupAt, now))
  if (!Number.isFinite(days) || days < 1) return 'today'
  return days === 1 ? 'yesterday' : `${days} days ago`
}

/** Saves the data as a .json file through the browser's normal download. */
export function downloadBackup(data: AppData): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${APP_NAME.toLowerCase()}-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
