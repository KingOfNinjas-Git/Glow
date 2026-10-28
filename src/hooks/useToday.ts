import { useEffect, useState } from 'react'
import { toDateKey } from '../lib/dates'

/** Today's date key, refreshed when the day rolls over or the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey())
  useEffect(() => {
    const update = () => setToday(toDateKey())
    const id = window.setInterval(update, 30_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return today
}
