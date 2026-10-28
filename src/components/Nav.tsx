import { motion } from 'framer-motion'
import { APP_NAME } from '../config/app'
import type { Route } from '../hooks/useHashRoute'

const ITEMS: { route: Route; label: string; icon: string }[] = [
  { route: 'home', label: 'Home', icon: '🏡' },
  { route: 'breathe', label: 'Breathe', icon: '🌬️' },
  { route: 'checkin', label: 'Check-in', icon: '💭' },
  { route: 'progress', label: 'Progress', icon: '🌱' },
  { route: 'settings', label: 'Settings', icon: '⚙️' },
]

export function Nav({ route, onGo }: { route: Route; onGo: (r: Route) => void }) {
  return (
    <>
      {/* desktop sidebar */}
      <nav aria-label="Main" className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-line bg-surface/70 p-5 backdrop-blur md:flex">
        <p className="mb-6 px-3 text-2xl font-black tracking-tight">
          <span className="text-accent-strong">✦</span> {APP_NAME}
        </p>
        {ITEMS.map((i) => (
          <NavButton key={i.route} item={i} active={route === i.route} onGo={onGo} layoutId="side" row />
        ))}
      </nav>
      {/* mobile bottom bar */}
      <nav
        aria-label="Main"
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
}: {
  item: (typeof ITEMS)[number]
  active: boolean
  onGo: (r: Route) => void
  layoutId: string
  row?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onGo(item.route)}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center rounded-2xl text-sm font-bold ${
        row ? 'gap-3 px-4 py-3 text-base' : 'min-w-16 flex-col px-3 py-1.5 text-xs'
      } ${active ? 'text-accent-strong' : 'text-ink-soft'}`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-2xl bg-accent-soft"
          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
        />
      )}
      <span className="relative text-xl" aria-hidden="true">
        {item.icon}
      </span>
      <span className="relative">{item.label}</span>
    </button>
  )
}
