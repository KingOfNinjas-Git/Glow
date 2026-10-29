import { useState } from 'react'
import { downloadBackup, needsBackupNudge } from '../lib/backup'
import { defaultStorage } from '../lib/storage'
import { useApp } from '../state/AppContext'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

/** Said once per visit, only when it matters: nothing will be saved at all, or it has been a while since a backup. */
export function BackupNudge() {
  const app = useApp()
  const [dismissed, setDismissed] = useState(false)
  const blocked = !defaultStorage.isPersistent()

  if (dismissed || (!blocked && !needsBackupNudge(app.data))) return null

  return (
    <Card role="region" aria-label="Backup" className="flex flex-wrap items-center justify-between gap-3 !p-4 text-sm">
      <p className="min-w-0 flex-1 basis-64">
        {blocked ? (
          <>
            <strong>Your browser isn’t saving anything</strong> (private window or blocked site data), so progress is lost when this tab closes. Download a backup to keep it.
          </>
        ) : (
          <>
            <strong>Your progress lives in this browser.</strong> A backup takes a second and means it can’t get lost if the browser data is cleared.
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
          Download a backup
        </Button>
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Later
        </Button>
      </div>
    </Card>
  )
}
