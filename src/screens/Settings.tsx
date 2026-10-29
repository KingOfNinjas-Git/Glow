import { useEffect, useRef, useState } from 'react'
import { useAbout } from '../components/About'
import { ReminderSettings } from '../components/ReminderSettings'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { Segmented, Switch } from '../components/ui/Controls'
import { Modal } from '../components/ui/Modal'
import { PALETTES } from '../data/unlocks'
import { LANGUAGES, useI18n, type LanguagePref } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { downloadBackup, lastBackupAge } from '../lib/backup'
import { useApp } from '../state/AppContext'
import { parseBackup } from '../state/persistence'
import type { AppData, ThemeMode } from '../state/types'

export function Settings() {
  const app = useApp()
  const { t, tn, pref, setPref } = useI18n()
  const { data, level } = app
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<AppData | null>(null)
  // remembered as a text key, so it follows a change of language
  const [restoreMessage, setRestoreMessage] = useState<{ key: MessageKey; good: boolean } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const about = useAbout()
  const { setPreviewPalette } = app
  const previewTheme = PALETTES.find((p) => p.id === app.previewPalette)
  const paletteName = (id: string) => t(`palette.${id}` as MessageKey)

  // A preview only lasts while Settings is open, so it can never be mistaken for the real theme.
  useEffect(() => () => setPreviewPalette(null), [setPreviewPalette])

  /** Read the chosen file, check it is a real backup, then ask before replacing anything. */
  const chooseBackup = async (file: File | undefined) => {
    if (!file) return
    setRestoreMessage(null)
    const result = parseBackup(await file.text())
    if (result.ok) setPendingRestore(result.data)
    else setRestoreMessage({ key: `restore.err.${result.error}` as MessageKey, good: false })
    if (fileInput.current) fileInput.current.value = '' // lets the same file be picked again
  }

  const backup = lastBackupAge(data.settings.lastBackupAt)
  const lastBackupText = backup.kind === 'days' ? t('backup.days', { n: backup.n }) : t(`backup.${backup.kind}` as MessageKey)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('settings.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('settings.sub')}</p>
      </header>

      <Card className="space-y-4">
        <SectionTitle>{t('settings.you')}</SectionTitle>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft">{t('settings.yourName')}</span>
          <input
            value={data.profile.name}
            maxLength={24}
            onChange={(e) => app.setProfileName(e.target.value)}
            placeholder={t('settings.namePlaceholder')}
            className="h-12 w-full rounded-2xl border border-line bg-surface2 px-4"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft">{t('settings.companionName')}</span>
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
        <SectionTitle>{t('settings.look')}</SectionTitle>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">{t('lang.label')}</p>
          <Segmented<LanguagePref>
            label={t('lang.label')}
            value={pref}
            onChange={setPref}
            options={[{ value: 'auto', label: t('lang.auto') }, ...LANGUAGES.map((l) => ({ value: l.id, label: l.name }))]}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">{t('settings.mode')}</p>
          <Segmented<ThemeMode>
            label={t('settings.mode.aria')}
            value={data.settings.themeMode}
            onChange={(v) => app.updateSettings({ themeMode: v })}
            options={[
              { value: 'system', label: t('mode.auto') },
              { value: 'light', label: t('mode.light') },
              { value: 'dark', label: t('mode.dark') },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">{t('settings.theme')}</p>
          <div role="radiogroup" aria-label={t('settings.theme.aria')} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                    <span className="block truncate text-sm font-bold">{paletteName(p.id)}</span>
                    <span className="block text-xs text-ink-soft">
                      {previewing
                        ? t('theme.previewing')
                        : locked
                          ? t('theme.locked', { n: p.unlockLevel })
                          : active
                            ? t('theme.inUse')
                            : t('theme.unlocked')}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {previewTheme && (
            <p role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-accent-soft p-3 text-sm">
              <span>{t('theme.previewNote', { name: paletteName(previewTheme.id), n: previewTheme.unlockLevel })}</span>
              <Button variant="soft" onClick={() => app.setPreviewPalette(null)}>
                {t('theme.stop')}
              </Button>
            </p>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionTitle>{t('settings.breathing')}</SectionTitle>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">{t('settings.vibration')}</p>
            <p className="text-sm text-ink-soft">{t('settings.vibration.hint')}</p>
          </div>
          <Switch checked={data.settings.haptics} onChange={(v) => app.updateSettings({ haptics: v })} label={t('settings.vibration.aria')} />
        </div>
      </Card>

      <Card>
        <SectionTitle>{t('settings.reminders')}</SectionTitle>
        <ReminderSettings />
      </Card>

      <Card className="space-y-3">
        <SectionTitle>{t('settings.data')}</SectionTitle>
        <p className="text-sm text-ink-soft">{t('settings.data.text', { when: lastBackupText })}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="soft"
            onClick={() => {
              downloadBackup(data)
              app.updateSettings({ lastBackupAt: new Date().toISOString() })
            }}
          >
            {t('settings.download')}
          </Button>
          <Button variant="soft" onClick={() => fileInput.current?.click()}>
            {t('settings.restore')}
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            {t('settings.startOver')}
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label={t('settings.restore.aria')}
          onChange={(e) => void chooseBackup(e.target.files?.[0])}
        />
        {restoreMessage && (
          <p role="status" className={`rounded-2xl p-3 text-sm ${restoreMessage.good ? 'bg-accent-soft' : 'bg-surface2 text-ink-soft'}`}>
            {t(restoreMessage.key)}
          </p>
        )}
        <p className="text-sm text-ink-soft">{t('settings.moving')}</p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>{t('settings.about')}</SectionTitle>
          <p className="-mt-2 text-sm text-ink-soft">{t('settings.about.text')}</p>
        </div>
        <Button variant="soft" onClick={about}>
          {t('nav.about')}
        </Button>
      </Card>

      <Modal open={pendingRestore !== null} onClose={() => setPendingRestore(null)} title={t('restore.title')}>
        <p className="text-ink-soft">
          {pendingRestore ? t('restore.text', { habits: tn('restore.habits', pendingRestore.habits.length), xp: pendingRestore.xp }) : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingRestore(null)}>
            {t('restore.keep')}
          </Button>
          <Button
            onClick={() => {
              if (pendingRestore) app.restoreAll(pendingRestore)
              setPendingRestore(null)
              setRestoreMessage({ key: 'restore.done', good: true })
            }}
          >
            {t('restore.yes')}
          </Button>
        </div>
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title={t('reset.title')}>
        <p className="text-ink-soft">{t('reset.text')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            {t('reset.keep')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              app.resetAll()
              setConfirmReset(false)
            }}
          >
            {t('reset.yes')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
