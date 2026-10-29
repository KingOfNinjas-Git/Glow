import { AnimatePresence, LazyMotion, MotionConfig, m } from 'framer-motion'
import { lazy, Suspense, type ComponentType } from 'react'
import { AboutProvider } from './components/About'
import { FxLayers } from './components/FxLayers'
import { Nav } from './components/Nav'
import { SampleBar } from './components/SampleBar'
import { useHashRoute, type Route } from './hooks/useHashRoute'
import { usePersistentStorage } from './hooks/usePersistentStorage'
import { useReminderScheduler } from './hooks/useReminderScheduler'
import { useShortcuts } from './hooks/useShortcuts'
import { useTheme } from './hooks/useTheme'
import { I18nProvider } from './i18n'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { useApp } from './state/AppContext'

// Only the home screen ships with the first load; the others arrive the first time they are opened (and are cached for offline).
const Breathe = lazy(() => import('./screens/Breathe').then((mod) => ({ default: mod.Breathe })))
const CheckIn = lazy(() => import('./screens/CheckIn').then((mod) => ({ default: mod.CheckIn })))
const Progress = lazy(() => import('./screens/Progress').then((mod) => ({ default: mod.Progress })))
const Settings = lazy(() => import('./screens/Settings').then((mod) => ({ default: mod.Settings })))

const loadMotionFeatures = () => import('./lib/motionFeatures').then((mod) => mod.default)

const SCREENS: Record<Route, ComponentType> = {
  home: Home,
  breathe: Breathe,
  checkin: CheckIn,
  progress: Progress,
  settings: Settings,
}

function Shell() {
  const { data, previewPalette } = useApp()
  const [route, go] = useHashRoute()
  useTheme(data.settings.themeMode, previewPalette ?? data.settings.palette)
  useReminderScheduler()
  useShortcuts(go)
  usePersistentStorage(data.profile.onboarded && !data.sample)

  if (!data.profile.onboarded) return <Onboarding />

  const Screen = SCREENS[route]
  return (
    <>
      <Nav route={route} onGo={go} />
      {/* The sidebar takes 15rem on a computer; the content then sits centred in the rest, never stretched edge to edge. */}
      <main className="px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 md:ml-60 md:px-10 md:pb-16 md:pt-10 lg:px-14">
        <div className="mx-auto w-full max-w-5xl">
          <SampleBar />
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={route}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={null}>
                <Screen />
              </Suspense>
            </m.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}

export default function App() {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <I18nProvider>
          <AboutProvider>
            <Shell />
          </AboutProvider>
          <FxLayers />
        </I18nProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
