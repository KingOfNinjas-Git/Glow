import { useState } from 'react'
import { REMINDER_MESSAGES } from '../data/content'
import { notificationSupport, pickMessageIndex, type NotificationSupport } from '../lib/reminders'
import { showSystemNotification } from '../hooks/useReminderScheduler'
import { useApp } from '../state/AppContext'
import { useFx } from '../state/FxContext'
import { Button } from './ui/Button'
import { Switch } from './ui/Controls'

const STATUS_COPY: Record<NotificationSupport, string> = {
  unsupported: 'This browser can’t show notifications, so reminders appear inside the app while it’s open.',
  default: 'Allow notifications so reminders can reach you.',
  granted: 'Notifications are on. Reminders arrive while the app is open or running in the background. If your phone has fully closed the app, they can be late or missing.',
  denied: 'Notifications are blocked in your browser settings. No worries: reminders will show up inside the app instead.',
}

export function ReminderSettings() {
  const app = useApp()
  const fx = useFx()
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
    const msg = REMINDER_MESSAGES[pickMessageIndex(app.data.settings.lastReminderMessage)]
    if (!(await showSystemNotification(msg.title, msg.body))) fx.toast(msg.title, msg.body)
  }

  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-surface2 p-3 text-sm text-ink-soft" role="status">
        {STATUS_COPY[support]}
      </p>
      <div className="flex flex-wrap gap-2">
        {support === 'default' && <Button onClick={ask}>Allow notifications</Button>}
        <Button variant="soft" onClick={test}>
          Send a test nudge
        </Button>
      </div>

      <ul className="space-y-2">
        {reminders.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface2 px-4 py-2">
            <input
              type="time"
              value={r.time}
              aria-label="Reminder time"
              onChange={(e) => e.target.value && app.updateReminder(r.id, { time: e.target.value, lastFired: undefined })}
              className="flex-1 bg-transparent text-lg font-bold"
            />
            <Switch checked={r.enabled} onChange={(v) => app.updateReminder(r.id, { enabled: v })} label={`Reminder at ${r.time}`} />
            <button
              type="button"
              onClick={() => app.removeReminder(r.id)}
              aria-label={`Remove reminder at ${r.time}`}
              className="rounded-full px-2 py-1 text-ink-soft hover:bg-line"
            >
              ✕
            </button>
          </li>
        ))}
        {reminders.length === 0 && <li className="text-sm text-ink-soft">No reminders yet. Totally optional.</li>}
      </ul>

      <div className="flex items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="New reminder time"
          className="h-12 rounded-2xl border border-line bg-surface2 px-3 text-lg font-bold"
        />
        <Button variant="soft" onClick={() => time && app.addReminder(time)}>
          + Add time
        </Button>
      </div>
    </div>
  )
}
