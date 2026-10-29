import { createContext, Fragment, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useApp } from '../state/AppContext'
import { en, type MessageKey } from './en'
import { es } from './es'
import { pt } from './pt'

export type Lang = 'en' | 'pt' | 'es'
export type LanguagePref = 'auto' | Lang

/** Language names are shown in their own language everywhere, so anyone can find theirs. */
export const LANGUAGES: { id: Lang; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'pt', name: 'Português' },
  { id: 'es', name: 'Español' },
]

const CATALOGS: Record<Lang, Record<MessageKey, string>> = { en, pt, es }

/** What the browser asks for ("pt-PT", "es-MX", ...) mapped to what the app has; English when there is no match. */
export function detectLanguage(preferred: readonly string[] = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])): Lang {
  for (const tag of preferred) {
    const base = tag.slice(0, 2).toLowerCase()
    if (base === 'pt' || base === 'es' || base === 'en') return base
  }
  return 'en'
}

export const resolveLanguage = (pref: LanguagePref | undefined, preferred?: readonly string[]): Lang =>
  pref && pref !== 'auto' ? pref : detectLanguage(preferred)

/** The same text in every language, lower-cased: to recognise something the person already has, whatever language they added it in. */
export const allTranslations = (key: MessageKey): string[] => Object.values(CATALOGS).map((c) => c[key].toLowerCase())

const LOCALES: Record<Lang, string> = { en: 'en-GB', pt: 'pt-PT', es: 'es-ES' }

export type Vars = Record<string, string | number>

/** Replaces {name} markers with values. A marker with no value is left as it is, so a mistake is visible, not blank. */
export function fill(template: string, vars: Vars = {}): string {
  let out = ''
  let at = 0
  while (at < template.length) {
    const open = template.indexOf('{', at)
    const close = open === -1 ? -1 : template.indexOf('}', open)
    if (close === -1) {
      out += template.slice(at)
      break
    }
    out += template.slice(at, open)
    const key = template.slice(open + 1, close)
    out += key in vars ? String(vars[key]) : template.slice(open, close + 1)
    at = close + 1
  }
  return out
}

type BaseOf<K> = K extends `${infer B}.one` ? B : never
/** Keys that exist as a singular and a plural form (key.one / key.other). */
export type PluralKey = BaseOf<MessageKey>

export interface I18n {
  lang: Lang
  /** For dates and numbers: "pt-PT", "es-ES", "en-GB". */
  locale: string
  pref: LanguagePref
  setPref: (pref: LanguagePref) => void
  t: (key: MessageKey, vars?: Vars) => string
  /** Picks the singular or plural text for a count (the count is also available as {n}). */
  tn: (key: PluralKey, n: number, vars?: Vars) => string
  /** Like t, but {markers} are replaced by React elements (for links inside a sentence). */
  rich: (key: MessageKey, nodes: Record<string, ReactNode>) => ReactNode
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const app = useApp()
  const pref = app.data.settings.language ?? 'auto'
  const lang = resolveLanguage(pref)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18n>(() => {
    const catalog = CATALOGS[lang]
    const text = (key: MessageKey) => catalog[key] ?? en[key]
    return {
      lang,
      locale: LOCALES[lang],
      pref,
      setPref: (next) => app.updateSettings({ language: next }),
      t: (key, vars) => fill(text(key), vars),
      tn: (key, n, vars) => fill(text(`${key}.${n === 1 ? 'one' : 'other'}` as MessageKey), { n, ...vars }),
      rich: (key, nodes) => {
        const template = text(key)
        const parts: ReactNode[] = []
        let at = 0
        while (at < template.length) {
          const open = template.indexOf('{', at)
          const close = open === -1 ? -1 : template.indexOf('}', open)
          if (close === -1) {
            parts.push(template.slice(at))
            break
          }
          parts.push(template.slice(at, open))
          const name = template.slice(open + 1, close)
          parts.push(<Fragment key={`${name}-${open}`}>{name in nodes ? nodes[name] : template.slice(open, close + 1)}</Fragment>)
          at = close + 1
        }
        return parts
      },
    }
    // updateSettings is rebuilt on every state change; only the language decides what the text is
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, pref, app.updateSettings])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

/** Shorthand for components that only need to translate. */
export const useT = () => useI18n().t
