import { LANGUAGES, useI18n } from '../i18n'

/** A small row of language buttons ("English · Português · Español") for the welcome screen and the sidebar. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, setPref, t } = useI18n()
  return (
    <div role="group" aria-label={t('lang.label')} className={`flex flex-wrap items-center justify-center gap-1 text-sm ${className}`}>
      {LANGUAGES.map((l, i) => (
        <span key={l.id} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="text-ink-soft">·</span>}
          <button
            type="button"
            lang={l.id}
            aria-pressed={lang === l.id}
            onClick={() => setPref(l.id)}
            className={`rounded-full px-2 py-1 font-bold ${lang === l.id ? 'bg-accent-soft text-accent-strong' : 'text-ink-soft hover:text-ink'}`}
          >
            {l.name}
          </button>
        </span>
      ))}
    </div>
  )
}
