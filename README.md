# Fathom — rebuild

A rebuild of [Fathom](https://fathom.video), the AI meeting notetaker, done as a
24-hour assignment. Built with **Next.js 16 + TypeScript + Tailwind v4**, shipped
as a static export.

**Live:** https://mjunaidarif.github.io/fathom-ai-rework/
**Agent logs:** [`.agent-logs/`](.agent-logs/) — raw prompt/response capture for every build turn.

---

## What it does

- **Meeting library** — everything captured, with stat tiles, an "upcoming —
  notetaker joining" strip, and My/Team filters.
- **Meeting playback synced to the transcript** — a play head that advances a
  clock; the current line highlights and the transcript auto-follows; click any
  line to seek; search within the call; speed control.
- **AI summaries with switchable templates** — General, Sales Discovery, Standup,
  1:1, Interview, Customer Success. Authored summaries where seeded; other
  templates are generated on-device from the transcript (labeled as such).
- **Action items** — toggle done, jump to the moment each came from.
- **Highlights → playlists** — clip a moment from the player; collect highlights
  into shareable playlists.
- **Cross-meeting search** — keyword search across every transcript, title, and
  participant, returning timestamped moments.
- **Ask Fathom** — natural-language Q&A across all calls via on-device retrieval,
  answering with sourced, timestamped moments (no LLM call; honest retrieval).
- **Sharing** — share a meeting or a clip via link (share modal).
- **Comments** — timestamped comments on a call.

State (highlights, action-item toggles, comments, playlists) persists in
`localStorage`.

## The capture layer is stubbed — on purpose

The brief explicitly allows faking the recording bot. Fathom's real web app is
gated behind installing an Electron desktop app and recording a live call, so
the capture layer here is stubbed with realistic **seed data** ([`lib/seed.ts`](lib/seed.ts))
— including an 8-person, ~1-hour roadmap call, a sales discovery call, a customer
success check-in, and a 1:1. All the time went into the product surface that gets
judged: the library, playback, summaries, search, Ask, highlights, and sharing.

## Run locally

```bash
npm install
npm run dev
```

Build the static export:

```bash
npm run build          # outputs to ./out
DEPLOY_TARGET=pages npm run build   # same, with the /fathom-ai-rework base path for GitHub Pages
```

## Deploy

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the static export and publishes it to GitHub Pages. Enable it once
under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Project structure

```
app/            routes: library (/), /meeting/[id], /search, /ask, /playlists
components/     UI + meeting/ (Player, Transcript, RightPanel, ShareModal)
lib/            types, seed data, summarizer, retrieval, player hook, store
recon/          product recon notes + proposed data model
.agent-logs/    committed prompt/response capture
```
