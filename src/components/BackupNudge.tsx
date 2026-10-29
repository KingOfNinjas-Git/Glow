import { useState } from 'react'
import { useI18n } from '../i18n'
import { downloadBackup, needsBackupNudge } from '../lib/backup'
import { defaultStorage } from '../lib/storage'
import { useApp } from '../state/AppContext'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

/** Said once per visit, only when it matters: nothing will be saved at all, or it has been a while since a backup. */
export function BackupNudge() {
  const app = useApp()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)
  const blocked = !defaultStorage.isPersistent()

  if (dismissed || (!blocked && !needsBackupNudge(app.data))) return null

  return (
    <Card role="region" aria-label={t('nudge.region')} className="flex flex-wrap items-center justify-between gap-3 !p-4 text-sm">
      <p className="min-w-0 flex-1 basis-64">
        {blocked ? (
          <>
            <strong>{t('nudge.blocked.lead')}</strong>
            {t('nudge.blocked.rest')}
          </>
        ) : (
          <>
            <strong>{t('nudge.old.lead')}</strong>
            {t('nudge.old.rest')}
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            downloadBackup(app.data)
            app.updateSettings({ lastBackupAt: new Date().toISOString() })
            setDismissed(true)
          }}
        >
          {t('settings.download')}
        </Button>
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          {t('nudge.later')}
        </Button>
      </div>
    </Card>
  )
}
