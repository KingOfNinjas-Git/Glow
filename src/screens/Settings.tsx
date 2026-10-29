import { useEffect, useRef, useState } from 'react'
import { useAbout } from '../components/About'
import { ReminderSettings } from '../components/ReminderSettings'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { Segmented, Switch } from '../components/ui/Controls'
import { Modal } from '../components/ui/Modal'
import { describeLastBackup, downloadBackup } from '../lib/backup'
import { PALETTES } from '../data/unlocks'
import { useApp } from '../state/AppContext'
import { parseBackup } from '../state/persistence'
import type { AppData, ThemeMode } from '../state/types'

export function Settings() {
  const app = useApp()
  const { data, level } = app
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<AppData | null>(null)
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; good: boolean } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const about = useAbout()
  const { setPreviewPalette } = app
  const previewTheme = PALETTES.find((p) => p.id === app.previewPalette)

  // A preview only lasts while Settings is open, so it can never be mistaken for the real theme.
  useEffect(() => () => setPreviewPalette(null), [setPreviewPalette])

  /** Read the chosen file, check it is a real backup, then ask before replacing anything. */
  const chooseBackup = async (file: File | undefined) => {
    if (!file) return
    setRestoreMessage(null)
    const result = parseBackup(await file.text())
    if (result.ok) setPendingRestore(result.data)
    else setRestoreMessage({ text: result.error, good: false })
    if (fileInput.current) fileInput.current.value = '' // lets the same file be picked again
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
        <p className="mt-1 text-ink-soft">Make it feel like yours.</p>
      </header>

      <Card className="space-y-4">
        <SectionTitle>You & your companion</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft">Your name</span>
          <input
            value={data.profile.name}
            maxLength={24}
            onChange={(e) => app.setProfileName(e.target.value)}
            placeholder="What should we call you?"
            className="h-12 w-full rounded-2xl border border-line bg-surface2 px-4"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft">Companion’s name</span>
          <input
            key={data.companion.name}
            defaultValue={data.companion.name}
            maxLength={16}
            onBlur={(e) => app.setCompanionName(e.target.value)}
            className="h-12 w-full rounded-2xl border border-line bg-surface2 px-4"
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <SectionTitle>Look & feel</SectionTitle>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">Mode</p>
          <Segmented<ThemeMode>
            label="Color mode"
            value={data.settings.themeMode}
            onChange={(v) => app.updateSettings({ themeMode: v })}
            options={[
              { value: 'system', label: 'Auto' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Cozy dark' },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">Theme (unlock more by leveling up, or tap a locked one to preview it)</p>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PALETTES.map((p) => {
              const locked = level.level < p.unlockLevel
              const previewing = app.previewPalette === p.id
              const active = !app.previewPalette && data.settings.palette === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active || previewing}
                  onClick={() => {
                    if (locked) {
                      app.setPreviewPalette(p.id)
                    } else {
                      app.setPreviewPalette(null)
                      app.updateSettings({ palette: p.id })
                    }
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left ${
                    active || previewing ? 'border-accent-strong bg-accent-soft' : 'border-line bg-surface'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})` }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{p.name}</span>
                    <span className="block text-xs text-ink-soft">
                      {previewing ? 'Previewing' : locked ? `🔒 Preview · level ${p.unlockLevel}` : active ? 'In use' : 'Unlocked'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {previewTheme && (
            <p role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-accent-soft p-3 text-sm">
              <span>
                Previewing <strong>{previewTheme.name}</strong>: it unlocks at level {previewTheme.unlockLevel}. Only the look changes, not your progress.
              </span>
              <Button variant="soft" onClick={() => app.setPreviewPalette(null)}>
                Stop preview
              </Button>
            </p>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionTitle>Breathing</SectionTitle>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">Soft vibration</p>
            <p className="text-sm text-ink-soft">A tiny buzz when it is time to breathe in, hold or out (phones that support it).</p>
          </div>
          <Switch checked={data.settings.haptics} onChange={(v) => app.updateSettings({ haptics: v })} label="Soft vibration while breathing" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Gentle reminders</SectionTitle>
        <ReminderSettings />
      </Card>

      <Card className="space-y-3">
        <SectionTitle>Your data</SectionTitle>
        <p className="text-sm text-ink-soft">
          Everything lives in this browser only. Nothing is uploaded anywhere. Last backup: <strong>{describeLastBackup(data.settings.lastBackupAt)}</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="soft"
            onClick={() => {
              downloadBackup(data)
              app.updateSettings({ lastBackupAt: new Date().toISOString() })
            }}
          >
            Download a backup
          </Button>
          <Button variant="soft" onClick={() => fileInput.current?.click()}>
            Restore a backup
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Start over
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a backup file to restore"
          onChange={(e) => void chooseBackup(e.target.files?.[0])}
        />
        {restoreMessage && (
          <p role="status" className={`rounded-2xl p-3 text-sm ${restoreMessage.good ? 'bg-accent-soft' : 'bg-surface2 text-ink-soft'}`}>
            {restoreMessage.text}
          </p>
        )}
        <p className="text-sm text-ink-soft">
          Moving to a new phone, or between the website and the app? Download a backup on one, then restore it on the other.
        </p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>About</SectionTitle>
          <p className="-mt-2 text-sm text-ink-soft">Who made this, how it works, and where your data lives.</p>
        </div>
        <Button variant="soft" onClick={about}>
          About this project
        </Button>
      </Card>

      <Modal open={pendingRestore !== null} onClose={() => setPendingRestore(null)} title="Restore this backup?">
        <p className="text-ink-soft">
          This replaces what is on this device now
          {pendingRestore ? ` with ${pendingRestore.habits.length} ${pendingRestore.habits.length === 1 ? 'habit' : 'habits'} and ${pendingRestore.xp} XP from the backup` : ''}. A
          backup of what you have now first is a nice idea.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingRestore(null)}>
            Keep what I have
          </Button>
          <Button
            onClick={() => {
              if (pendingRestore) app.restoreAll(pendingRestore)
              setPendingRestore(null)
              setRestoreMessage({ text: 'Backup restored. Welcome back ✨', good: true })
            }}
          >
            Yes, restore
          </Button>
        </div>
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Start over?">
        <p className="text-ink-soft">This clears your habits, XP and history on this device. It can’t be undone (a backup first is a nice idea).</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Keep everything
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              app.resetAll()
              setConfirmReset(false)
            }}
          >
            Yes, reset
          </Button>
        </div>
      </Modal>
    </div>
  )
}
