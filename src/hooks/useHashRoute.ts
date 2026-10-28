import { useCallback, useEffect, useState } from 'react'

export const ROUTES = ['home', 'breathe', 'checkin', 'progress', 'settings'] as const
export type Route = (typeof ROUTES)[number]

const parse = (): Route => {
  const h = window.location.hash.replace('#/', '').replace('#', '')
  return (ROUTES as readonly string[]).includes(h) ? (h as Route) : 'home'
}

/** Tiny hash router: works offline, no server config, back button just works. */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const go = useCallback((r: Route) => {
    window.location.hash = `#/${r}`
  }, [])
  return [route, go]
}
