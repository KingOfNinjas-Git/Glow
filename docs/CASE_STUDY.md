# Glow: a self-care app with no streak guilt

*A draft for the project page. Every number below was measured on the live site.*

## The idea

Most habit apps punish you for missing a day. Glow does the opposite: tiny habits, breathing exercises and mood check-ins earn XP that grows a little plant companion and unlocks themes. Skipped days cost nothing, XP is never taken away, and nothing needs an account. All data stays in the browser.

Live: https://glow.franciscowebdev.com

## What I built

- A React + TypeScript app that works as a website and installs like an app (works offline).
- Habits, a breathing circle with phase timing, mood check-ins with history, a month view of "days you showed up", six themes and six plant growth stages that unlock by level.
- Backup and restore of everything as a file, so data can move between devices without a server.
- English, Portuguese and Spanish, following the browser language.

## The problem I noticed late, and fixed

A progress app looks empty on the first visit, and its best parts (themes, the grown plant, charts) take months to earn. A visitor trying it for two minutes would see a seed, 0 XP and an empty calendar.

So the first screen now offers **Explore with sample data**: thirty days of believable, seeded history whose XP is exactly what the real rules would have granted. A small bar lets a visitor jump to any level, locked themes can be previewed, and the companion can be seen at every level, none of which touches real progress. A short "Things to try" list ticks itself off from what the visitor actually does.

## Decisions worth explaining

- **Pure logic, thin screens.** Levels, XP rules, backups and sample data are plain functions with unit tests; screens only draw them.
- **Safe restores.** A backup file is validated and normalised before anything is replaced, and the app asks first. A wrong file changes nothing.
- **Honest about limits.** Reminders only fire while the app is running, because a static site has no push server. The app says so on the settings screen instead of promising more.
- **Locking the phone pauses a breathing session** instead of finishing it (a frame that took far longer than expected counts as a short step), and the screen is kept awake during a session.
- **Language is data, not code.** Every sentence lives in one catalogue per language, and the type checker refuses to build if Portuguese or Spanish miss a key.

## How I checked it

- 82 unit tests and 54 browser tests that run in real **Firefox and WebKit** (the engine behind Safari), on a computer-sized and a phone-sized window: sample data, XP, check-in, theme preview, backup download, start over, restore, a wrong file, breathing, offline use, keyboard shortcuts, and all three languages. They also run against the live site.
- Automated accessibility checks (axe) report no violations on any screen, in light and dark, on phone and computer, in all three languages.
- A strict Content-Security-Policy and security headers on the server.
- Lighthouse on the live site, simulated slow phone: performance 94, accessibility 100, best practices 100, SEO 100 (first paint 1.5 s, no layout shift). The first download is about 80 KB compressed (it was 133 KB before the other screens and the animation code were loaded on demand).

## Things the tests caught that I would have missed

- Long Portuguese and Spanish words pushed the bottom navigation and a selector off a 320 px screen.
- Choosing a language and then loading the sample data reset the language.
- A very quick tap right after a screen opened could be missed by the router.
- Sample habits were stored in English, so Portuguese visitors saw English names.
- A security header I had added (Cross-Origin-Opener-Policy) made Lighthouse and PageSpeed fail to record the page load, which would have shown reviewers a failed run on the live site. Running the audit on the real address, not only locally, caught it; the header is gone and the reason is written next to the others.

## Added since the first version

- **Habits on their own days.** A habit can be meant for some weekdays only. The others wait in a quiet list and can still be ticked for XP, so a schedule is a help, never a lock.
- **Two more breathing exercises**, Coherent (5 in, 5 out) and Sigh (two quick sips of air, one long breath out), which needed the breathing circle to learn that a phase can start and end at any size.
- **A garden after the last unlock.** From level 16 a new plant grows beside the companion every two levels, so there is still something to look forward to after the crown.

## What I would do next

- Real reminders need a small server (web push); today they are best-effort.
- More gentle exercises beyond breathing (a short grounding exercise, a body check-in).
