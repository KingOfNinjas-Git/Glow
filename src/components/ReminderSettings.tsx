import { useState } from 'react'
import { showSystemNotification } from '../hooks/useReminderScheduler'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { notificationSupport, pickMessageIndex, type NotificationSupport } from '../lib/reminders'
import { useApp } from '../state/AppContext'
import { useFx } from '../state/FxContext'
import { Button } from './ui/Button'
import { Switch } from './ui/Controls'

const STATUS_KEY: Record<NotificationSupport, MessageKey> = {
  unsupported: 'rem.unsupported',
  default: 'rem.default',
  granted: 'rem.granted',
  denied: 'rem.denied',
}

export function ReminderSettings() {
  const app = useApp()
  const fx = useFx()
  const { t } = useI18n()
  const [support, setSupport] = useState<NotificationSupport>(notificationSupport)
  const [time, setTime] = useState('09:00')
  const reminders = [...app.data.settings.reminders].sort((a, b) => a.time.localeCompare(b.time))

  const ask = async () => {
    try {
      setSupport((await Notification.requestPermission()) as NotificationSupport)
    } catch {
      setSupport(notificationSupport())
    }
  }

  const test = async () => {
    const idx = pickMessageIndex(app.data.settings.lastReminderMessage)
    const title = t(`rem.${idx}.title` as MessageKey)
    const body = t(`rem.${idx}.body` as MessageKey)
    if (!(await showSystemNotification(title, body))) fx.toast(title, body)
  }

  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-surface2 p-3 text-sm text-ink-soft" role="status">
        {t(STATUS_KEY[support])}
      </p>
      <div className="flex flex-wrap gap-2">
        {support === 'default' && <Button onClick={ask}>{t('rem.allow')}</Button>}
        <Button variant="soft" onClick={test}>
          {t('rem.test')}
        </Button>
      </div>

      <ul className="space-y-2">
        {reminders.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface2 px-4 py-2">
            <input
              type="time"
              value={r.time}
              aria-label={t('rem.time.aria')}
              onChange={(e) => e.target.value && app.updateReminder(r.id, { time: e.target.value, lastFired: undefined })}
              className="flex-1 bg-transparent text-lg font-bold"
            />
            <Switch checked={r.enabled} onChange={(v) => app.updateReminder(r.id, { enabled: v })} label={t('rem.switch', { time: r.time })} />
            <button
              type="button"
              onClick={() => app.removeReminder(r.id)}
              aria-label={t('rem.remove', { time: r.time })}
              className="rounded-full px-2 py-1 text-ink-soft hover:bg-line"
            >
              ✕
            </button>
          </li>
        ))}
        {reminders.length === 0 && <li className="text-sm text-ink-soft">{t('rem.none')}</li>}
      </ul>

      <div className="flex items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label={t('rem.new.aria')}
          className="h-12 rounded-2xl border border-line bg-surface2 px-3 text-lg font-bold"
        />
        <Button variant="soft" onClick={() => time && app.addReminder(time)}>
          {t('rem.add')}
        </Button>
      </div>
    </div>
  )
}
