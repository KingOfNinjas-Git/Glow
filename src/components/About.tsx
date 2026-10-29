import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { APP_NAME, AUTHOR } from '../config/app'
import { useI18n } from '../i18n'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

const AboutContext = createContext<() => void>(() => {})

/** Opens the "About" box from anywhere (the sidebar, the welcome screen, Settings). */
export const useAbout = () => useContext(AboutContext)

export function AboutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { t, rich } = useI18n()
  const show = useCallback(() => setOpen(true), [])
  const value = useMemo(() => show, [show])

  const link = 'font-bold text-accent-strong underline'

  return (
    <AboutContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title={t('about.title', { app: APP_NAME })}>
        <div className="space-y-3 text-ink-soft">
          <p>{t('about.p1', { app: APP_NAME })}</p>
          <p>
            <strong className="text-ink">{t('about.p2.lead')}</strong>
            {t('about.p2.rest')}
          </p>
          <p>
            {rich('about.p3', {
              author: (
                <a className={link} href={AUTHOR.url} target="_blank" rel="noopener">
                  {AUTHOR.name}
                </a>
              ),
            })}
          </p>
          <p>
            {rich('about.p4', {
              contact: (
                <a className={link} href={`${AUTHOR.url}/#contact`} target="_blank" rel="noopener">
                  {t('about.contact')}
                </a>
              ),
            })}
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setOpen(false)}>{t('common.close')}</Button>
        </div>
      </Modal>
    </AboutContext.Provider>
  )
}
