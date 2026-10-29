import { m } from 'framer-motion'
import { APP_NAME } from '../config/app'
import type { Route } from '../hooks/useHashRoute'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { useAbout } from './About'
import { LanguageSwitch } from './LanguageSwitch'

const ITEMS: { route: Route; label: MessageKey; icon: string }[] = [
  { route: 'home', label: 'nav.home', icon: '🏡' },
  { route: 'breathe', label: 'nav.breathe', icon: '🌬️' },
  { route: 'checkin', label: 'nav.checkin', icon: '💭' },
  { route: 'progress', label: 'nav.progress', icon: '🌱' },
  { route: 'settings', label: 'nav.settings', icon: '⚙️' },
]

export function Nav({ route, onGo }: { route: Route; onGo: (r: Route) => void }) {
  const about = useAbout()
  const { t } = useI18n()
  return (
    <>
      {/* desktop sidebar */}
      <nav aria-label={t('nav.main')} className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-line bg-surface/70 p-5 backdrop-blur md:flex">
        <p className="mb-6 px-3 text-2xl font-black tracking-tight">
          <span className="text-accent-strong">✦</span> {APP_NAME}
        </p>
        {ITEMS.map((i, n) => (
          <NavButton key={i.route} item={i} active={route === i.route} onGo={onGo} layoutId="side" row shortcut={n + 1} />
        ))}
        <div className="mt-auto space-y-3 px-3 text-xs text-ink-soft">
          <LanguageSwitch className="!justify-start -ml-2" />
          <p>{t('nav.tip')}</p>
          <button type="button" onClick={about} className="font-bold text-accent-strong underline">
            {t('nav.about')}
          </button>
        </div>
      </nav>
      {/* mobile bottom bar */}
      <nav
        aria-label={t('nav.main')}
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-surface/90 px-2 pt-2 backdrop-blur md:hidden"
      >
        {ITEMS.map((i) => (
          <NavButton key={i.route} item={i} active={route === i.route} onGo={onGo} layoutId="bottom" />
        ))}
      </nav>
    </>
  )
}

function NavButton({
  item,
  active,
  onGo,
  layoutId,
  row,
  shortcut,
}: {
  item: (typeof ITEMS)[number]
  active: boolean
  onGo: (r: Route) => void
  layoutId: string
  row?: boolean
  /** the number key that opens this screen (computer sidebar only) */
  shortcut?: number
}) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={() => onGo(item.route)}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center rounded-2xl text-sm font-bold ${
        row ? 'gap-3 px-4 py-3 text-base' : 'min-w-0 flex-1 flex-col px-1 py-1.5 text-[11px] sm:text-xs'
      } ${active ? 'text-accent-strong' : 'text-ink-soft'}`}
    >
      {active && (
        <m.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-2xl bg-accent-soft"
          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
        />
      )}
      <span className="relative text-xl" aria-hidden="true">
        {item.icon}
      </span>
      <span className={`relative ${row ? '' : 'max-w-full truncate'}`}>{t(item.label)}</span>
      {shortcut && (
        <kbd aria-hidden="true" className="relative ml-auto rounded-md border border-line px-1.5 text-xs font-bold text-ink-soft">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}
