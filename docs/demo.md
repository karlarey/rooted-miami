# Demo script: 2 minutes + 1 minute Q&A

Rule of the room: show the working product, not slides. About 260 spoken words.

## Before you go up (5 min)
- [ ] `npm run dev` from the repo root; open `localhost:3000` in a clean browser window, zoom 110–125%.
- [ ] `.env.local` has `GEMINI_API_KEY` and `GEMMA_MODEL=gemma-4-26b-a4b-it`.
- [ ] **Restart the dev server** so the company pipeline is empty (it's in memory).
- [ ] Tabs pre-opened: (1) engineer journey `/journey` signed in, (2) `/companies/finder`.
- [ ] Run Talent Finder once as a warm-up. Gemma 4 takes 15–30s; the first call is slowest.
- [ ] Backup: screenshots of each step in case the Wi-Fi drops.

## 0:00–0:15 · The problem (no clicks)
> "Miami attracts engineers, but it doesn't keep them. Miami-Dade tech workers leave at **twice the rate** of everyone else: 10.9% a year. Miami pays about the same as Austin but costs 16% more, so they move. And they leave before they ever put down roots."

## 0:15–0:50 · Rooted for People (tab 1)
> "Rooted is a two-sided platform. For engineers: belonging, one side quest at a time."
- Show the journey: level path 🌱 → 🌳, one side quest (a ritual like the Sunday run club, mentoring FIU students).
- Open Pana for one exchange: "Your AI local companion, who reaches out *before* you think about leaving."
- Show **Sharing**: "Engineers choose what companies see. Nothing is shared by default."

## 0:50–1:40 · Rooted for Business (tab 2: `/companies/finder`)
> "For companies: find talent that's already here, and pay them enough to stay."
1. Click **Find talent** with the pre-filled request ("fintech in Wynwood, 3 senior backend engineers, hybrid, Go and PostgreSQL").
   > "Results show up instantly. Now **Gemma 4**, an open model, reads the request and drafts a personal message."
2. While Gemma thinks, point at the **Top 3**: "Only engineers who opted in. Ranked by skills, then how rooted they are in Miami. No names, no contact info."
3. Click **Reach out** on #1. Clear the band and type **170000–180000**.
   > "Every message needs a pay band. And look: **Below Austin parity.** That's where this engineer would go."
4. Click the suggested band back in (or type **181000–196000**) → **Competitive** → **Send**.
   > "Gemma picks the people and the words. The pay comes from **federal BLS data**, never from the AI."
5. Point at **Pull 3 new**: "Nobody replies? Pull three new."
6. Scroll to **Market rates**: "Senior engineers: Miami $166K, Austin $169K, NYC $206K. To compete, offer $196K."

## 1:40–2:00 · Close
> "More rooted engineers attract more companies, and more companies give engineers more reasons to stay. Rooted: **new city, new roots.** It's open source, MIT-licensed, and runs on Gemma 4."

## Likely questions
- **Is the talent real?** Not yet: the pool is simulated (seeded, deterministic). The aggregates and matching run the same code the backend would use on real, opted-in profiles.
- **Why should a company trust the pay numbers?** BLS OEWS May 2025 for Miami, Austin and NYC metros, plus BEA price parities. Base pay only. Seniority maps to wage percentiles.
- **Privacy?** Opt-in only; companies see just the fields an engineer chose to share; never wellbeing or intent-to-stay; a blocked company sees "Not right now".
- **Why Gemma 4?** It's open-weight, so it qualifies as open-source AI and could run locally. We use `gemma-4-26b-a4b-it` via the Gemini API. It thinks before answering (15–30s), so the UI shows an instant read first.
- **Business model?** Engineers are free; companies pay for hiring access and for retention of the people they relocate.
