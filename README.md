# Misbah-ul-Huda — Shia Islamic Companion

An installable web app (PWA) for daily prayers, Qaza tracking and worship —
built around one idea: **the prayers you missed matter as much as the ones you pray.**

**Live app:** https://waki44.github.io/islamic-companion/
Open it in Safari/Chrome on your phone → Share → *Add to Home Screen* — it installs
like a native app and works offline.

![Misbah-ul-Huda logo](logo.png)

## Features
- **Daily prayer tracker** — Fajr, Dhuhr, Asr, Maghrib, Isha with a progress ring
- **Qaza tracker** — a separate counter for every prayer (including Namaz-e-Ayat),
  with one-tap "performed" and manual adjustment
- **Qaza Khatam Plan** — set a daily target and see the date you will finish
- **Auto-Qaza suggestion** — unmarked days are suggested as Qaza automatically
- **Ladies' section** — cycle days are marked privately and **never count as Qaza**
- **Tasbeeh counter** — 7 dhikrs, 33/100/1000 cycles, lifetime total
- **Library (Arabic + English)** — complete verified texts: Ziyarat-e-Ashura,
  Ziyarat-e-Waritha, Dua-e-Kumayl, Dua-e-Nudba, Dua-e-Tawassul, Hadith-e-Kisa,
  Surah Ya-Sin, Surah Al-Mulk
- **Jafari prayer times** (Tehran calculation), Qibla direction, Hijri calendar
  with wiladat/shahadat dates, monthly report, Ramzan mode
- **Accounts & cloud backup** — Google sign-in with per-user cloud sync
  (Supabase + Row Level Security; see [BACKEND.md](BACKEND.md))

## Case study
Most prayer apps are built around today's prayers. For many Muslims, the real
weight is the backlog — months of missed (Qaza) prayers with no count and no
plan. Misbah-ul-Huda is designed backlog-first: count what is owed prayer by
prayer, make the number visibly shrink, and project the finish date.

Key decisions: ladies' period days **never** count as Qaza (a first-class state
in the data model, excluded from auto-Qaza by design); no guilt mechanics — a
calm interface instead of streaks and warnings; and content integrity — every
library text is complete and verified segment by segment (Ziyarat-e-Ashura 124,
Dua-e-Kumayl 250, Dua-e-Nudba 222).

Hardest bug: on iPhone, rapid taps on the Qaza + button triggered Safari's
double-tap zoom. Safari's PWA mode ignores `touch-action` and `user-scalable`,
so the fix is a JS `touchend` suppressor that blocks the zoom but re-fires the
tap as a click — counts never miss. Full case study on the portfolio:
https://portfolio-website-sigma-ashen-90.vercel.app/projects/misbah-ul-huda

## Tech
Vanilla JavaScript PWA · Adhan.js prayer times · Supabase (Auth + Postgres)
backend · GitHub Pages hosting · Service Worker offline cache

## Design
"Luminous Courtyard" spatial UI — crimson, golden amber, warm taupe and
near-black navy, with a floating glass navigation bar.

## Run locally
Any static server works, e.g. `npx serve .` — then open the printed URL.
