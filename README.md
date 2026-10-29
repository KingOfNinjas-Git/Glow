# Glow ✨

A gentle self-care PWA for Gen Z. Tiny habits, breathing exercises and mood check-ins earn XP that levels up a little plant companion and unlocks cosmetic themes. No streak penalties, no guilt, no backend.

**Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, vite-plugin-pwa, Vitest.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests (XP/level curve, dates, breathing, actions, reminders) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Typecheck + production build (generates the service worker) |
| `npm run preview` | Serve the production build. **Use this to test install and offline.** |
| `npm run icons` | Regenerate PWA icons in `public/` (dependency-free script) |

The service worker only runs in the production build. Run `npm run build && npm run preview`, open the app, then go offline and reload. It keeps working. Browsers show an "Install" option from there.

## Renaming the app

"Glow" is a placeholder. Change it in **`src/config/app.ts`** (`APP_NAME`, `APP_TAGLINE`, `STORAGE_KEY`). The page title, PWA manifest and UI all read from there. Changing `STORAGE_KEY` starts users with fresh data. Also update the key in the inline script in `index.html` only if you hardcode it (it is injected automatically).

## How it works

### XP and levels (`src/lib/xp.ts`)
- Rewards: habit **10**, breathing session **15**, daily check-in **10**.
- Level `n` → `n+1` costs `round(40 · n^1.4 / 5) · 5` XP (40, 105, 185, 280, …), so levels get gradually harder.
- Level is always derived from total XP, never stored.
- Anti-farming without punishment: a habit gives XP once per day, and the check-in once per day. Unticking never removes XP. Skipped days cost nothing.

### Unlocks (`src/data/unlocks.ts`)
Six themes (Peach L1, Lavender L2, Mint L4, Sky L6, Rosé L9, Aurora L13), six companion growth stages (seed → in bloom) and five accessories (rosy cheeks, sparkles, bow, shades, crown) tied to levels.

### Data and storage
All data is one versioned JSON object under `STORAGE_KEY`, accessed through `src/lib/storage.ts` (`StorageAdapter`) and `src/state/persistence.ts`. Components never touch `localStorage`. To add a backend later, implement a new adapter or replace `persistence.ts` with an async repository. State transitions in `src/state/actions.ts` are pure functions, so they can be reused server-side.

**Backups.** Settings has *Download a backup* and *Restore a backup*. A restore is checked first (`parseBackup` in `persistence.ts` refuses anything that is not clearly a Glow backup, and fills in settings an older backup does not have), then asks before replacing anything. This is how you move between the website and the phone app, or to a new phone. **Two copies open at once** (the browser tab and the installed app) stay in sync: each listens for the other's saves (`storage` event) instead of overwriting them.

### Breathing
The session clock only advances while the app is showing (`advanceElapsed` in `src/lib/breathing.ts`), so locking the phone pauses it instead of finishing it and awarding XP. The screen is kept awake during a session (Screen Wake Lock, `src/hooks/useWakeLock.ts`), and a soft vibration marks each phase on phones that support it (a setting).

### Reminders
Uses the Notification API (through the service worker when available). Permission is requested only when you tap the button. If notifications are denied or unsupported, reminders show as a soft in-app toast instead. **Limitation:** with no backend or push server, a reminder can only fire while the app is open or running in the background. A reminder that is more than 5 minutes late is skipped rather than nagging. Real push notifications need a backend later.

### Accessibility
Pastel palette with dark-ink text and strong accent colours for text (≥4.5:1). Honors `prefers-reduced-motion` (Framer Motion `MotionConfig` plus CSS). Keyboard-focusable controls, labelled radios and switches, dialog focus handling.

## Project layout

```
src/
  config/      app name & storage key
  lib/         pure logic + tests (xp, dates, breathing, stats, reminders, storage)
  data/        unlocks, habit suggestions, moods, reminder messages
  state/       data model, pure actions, persistence, React contexts
  hooks/       theme, router, reminder scheduler, today
  components/  small typed UI pieces (ui/ holds primitives)
  screens/     Home, Breathe, CheckIn, Progress, Settings, Onboarding
```

## Putting it online (Hostinger, as a subdomain)

Glow is a static site: there is nothing to run on the server.

1. In hPanel create the subdomain (for example `glow.franciscowebdev.com`) with its own folder. It has to be the **root** of a (sub)domain, because the install manifest uses `/` as its start address.
2. `npm run build` (the PWA step takes about a minute).
3. Upload the **contents** of `dist/` (not the folder itself) to that subdomain's folder. `dist/.htaccess` comes from `public/.htaccess`: it keeps `index.html` and `sw.js` from being cached for long (so an update reaches your phone) and caches the hashed files in `assets/` for a year.
4. Open the address once, then on Android in Chrome use **⋮ → Install app** (or the install banner). Long-press the icon for the *Breathe* and *Check in* shortcuts.

To update later: build, upload `dist/` again. The app updates itself the next time it opens.

Your data lives in the browser or app it was created in. The website tab and the installed app on one phone share it; a second device starts empty until you restore a backup there.
