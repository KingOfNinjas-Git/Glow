import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { FxLayers } from './components/FxLayers'
import { Nav } from './components/Nav'
import { useHashRoute, type Route } from './hooks/useHashRoute'
import { useReminderScheduler } from './hooks/useReminderScheduler'
import { useTheme } from './hooks/useTheme'
import { Breathe } from './screens/Breathe'
import { CheckIn } from './screens/CheckIn'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Progress } from './screens/Progress'
import { Settings } from './screens/Settings'
import { useApp } from './state/AppContext'

const SCREENS: Record<Route, () => React.ReactElement> = {
  home: Home,
  breathe: Breathe,
  checkin: CheckIn,
  progress: Progress,
  settings: Settings,
}

function Shell() {
  const { data } = useApp()
  const [route, go] = useHashRoute()
  useTheme(data.settings.themeMode, data.settings.palette)
  useReminderScheduler()

  if (!data.profile.onboarded) return <Onboarding />

  const Screen = SCREENS[route]
  return (
    <>
      <Nav route={route} onGo={go} />
      <main className="safe-top mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:ml-60 md:w-auto md:max-w-none md:px-10 md:pb-12 lg:px-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Shell />
      <FxLayers />
    </MotionConfig>
  )
}
