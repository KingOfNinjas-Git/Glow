import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Unlock } from '../data/unlocks'

export interface Origin {
  x: number
  y: number
}

export interface FloatItem {
  id: number
  amount: number
  x: number
  y: number
}

export interface LevelUpInfo {
  level: number
  unlocks: Unlock[]
}

export interface ToastItem {
  id: number
  title: string
  body: string
}

interface FxApi {
  floats: FloatItem[]
  levelUp: LevelUpInfo | null
  toasts: ToastItem[]
  floatXp: (amount: number, origin?: Origin) => void
  celebrate: (info: LevelUpInfo) => void
  dismissLevelUp: () => void
  toast: (title: string, body: string) => void
  dismissToast: (id: number) => void
  removeFloat: (id: number) => void
}

const FxContext = createContext<FxApi | null>(null)
let counter = 0

export function FxProvider({ children }: { children: ReactNode }) {
  const [floats, setFloats] = useState<FloatItem[]>([])
  const [levelUp, setLevelUp] = useState<LevelUpInfo | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const floatXp = useCallback((amount: number, origin?: Origin) => {
    const x = origin?.x ?? window.innerWidth / 2
    const y = origin?.y ?? window.innerHeight / 3
    setFloats((f) => [...f, { id: ++counter, amount, x, y }])
    try {
      navigator.vibrate?.(12)
    } catch {
      /* haptics are a nicety only */
    }
  }, [])
  const removeFloat = useCallback((id: number) => setFloats((f) => f.filter((i) => i.id !== id)), [])
  const celebrate = useCallback((info: LevelUpInfo) => setLevelUp(info), [])
  const dismissLevelUp = useCallback(() => setLevelUp(null), [])
  const toast = useCallback((title: string, body: string) => setToasts((t) => [...t, { id: ++counter, title, body }]), [])
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((i) => i.id !== id)), [])

  const api = useMemo(
    () => ({ floats, levelUp, toasts, floatXp, celebrate, dismissLevelUp, toast, dismissToast, removeFloat }),
    [floats, levelUp, toasts, floatXp, celebrate, dismissLevelUp, toast, dismissToast, removeFloat],
  )
  return <FxContext.Provider value={api}>{children}</FxContext.Provider>
}

export function useFx(): FxApi {
  const ctx = useContext(FxContext)
  if (!ctx) throw new Error('useFx must be used inside FxProvider')
  return ctx
}

/** Where to spawn the floating XP: the middle of the element that was tapped. */
export function originOf(el: Element | null | undefined): Origin | undefined {
  if (!el) return undefined
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}
