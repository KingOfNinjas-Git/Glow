import { useState } from 'react'
import { ReminderSettings } from '../components/ReminderSettings'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { Segmented } from '../components/ui/Controls'
import { Modal } from '../components/ui/Modal'
import { APP_NAME } from '../config/app'
import { PALETTES } from '../data/unlocks'
import { useApp } from '../state/AppContext'
import type { ThemeMode } from '../state/types'

function exportData(json: string) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${APP_NAME.toLowerCase()}-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function Settings() {
  const app = useApp()
  const { data, level } = app
  const [confirmReset, setConfirmReset] = useState(false)

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
          <p className="mb-2 text-sm font-bold text-ink-soft">Theme (unlock more by leveling up)</p>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PALETTES.map((p) => {
              const locked = level.level < p.unlockLevel
              const active = data.settings.palette === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={locked}
                  onClick={() => app.updateSettings({ palette: p.id })}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left disabled:opacity-60 ${
                    active ? 'border-accent-strong bg-accent-soft' : 'border-line bg-surface'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})` }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{p.name}</span>
                    <span className="block text-xs text-ink-soft">{locked ? `🔒 Level ${p.unlockLevel}` : active ? 'In use' : 'Unlocked'}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Gentle reminders</SectionTitle>
        <ReminderSettings />
      </Card>

      <Card className="space-y-3">
        <SectionTitle>Your data</SectionTitle>
        <p className="text-sm text-ink-soft">Everything lives on this device only. Nothing is uploaded anywhere.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="soft" onClick={() => exportData(JSON.stringify(data, null, 2))}>
            Download a backup
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Start over
          </Button>
        </div>
      </Card>

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
