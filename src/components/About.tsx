import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { APP_NAME, AUTHOR } from '../config/app'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

const AboutContext = createContext<() => void>(() => {})

/** Opens the "About" box from anywhere (the sidebar, the welcome screen, Settings). */
export const useAbout = () => useContext(AboutContext)

export function AboutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  const value = useMemo(() => show, [show])

  return (
    <AboutContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title={`About ${APP_NAME}`}>
        <div className="space-y-3 text-ink-soft">
          <p>
            {APP_NAME} is a gentle self-care app: tiny habits, breathing exercises and mood check-ins earn XP that grows a little plant friend.
            No streaks to lose, no guilt, and no account.
          </p>
          <p>
            <strong className="text-ink">Your data stays on your device.</strong> Nothing is uploaded. You can download a backup any time
            from Settings and restore it somewhere else.
          </p>
          <p>
            It is a portfolio project by{' '}
            <a className="font-bold text-accent-strong underline" href={AUTHOR.url} target="_blank" rel="noopener">
              {AUTHOR.name}
            </a>
            , a web developer who builds fast, accessible websites and apps. Built with React, TypeScript, Vite and Tailwind. It installs like an
            app and keeps working offline.
          </p>
          <p>
            Want something like this for your own idea?{' '}
            <a className="font-bold text-accent-strong underline" href={`${AUTHOR.url}/#contact`} target="_blank" rel="noopener">
              Get in touch
            </a>
            .
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Modal>
    </AboutContext.Provider>
  )
}
