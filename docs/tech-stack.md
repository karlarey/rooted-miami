# Tech stack

| Layer | Choice | Status | Why |
|---|---|---|---|
| Framework | **Next.js 16** (App Router) + **TypeScript** | ✅ In repo | UI and API in one codebase; one deploy |
| Styling | **Tailwind CSS 4** | ✅ In repo | Fast iteration |
| El Pana's brain | **Gemini** (`gemini-flash-latest`) via `@google/genai` | ✅ In repo | Cheap/free tier, fast, hackathon points |
| | **Ollama** (`llama3.1:8b`, local) | ✅ In repo | Free, private, works offline: "your data never leaves the device" |
| | **Mock** | ✅ In repo | Demo works with no keys or network |
| Recommendation engine | TypeScript scoring (`src/lib/recommend.ts`) | ✅ In repo | Explainable, no training data needed at cold start |
| Database | **SQLite + Drizzle ORM** for the hackathon → Postgres in production | 🟡 Proposed | Zero setup locally; Drizzle schema moves to Postgres unchanged |
| SMS | **Twilio** | 🟡 Proposed | Judges text El Pana from their phones |
| Maps | **Leaflet + OpenStreetMap** | 🟡 Proposed | Free, no API key |
| Charts | **Recharts** | 🟡 Proposed | Journey and dashboard charts |
| Hosting | **Vercel** | 🟡 Proposed | Native Next.js deploys |

## Switching El Pana's provider

Set in `.env.local`:

```bash
PANA_PROVIDER=gemini   # or ollama, or mock
GEMINI_API_KEY=...     # for gemini
OLLAMA_MODEL=llama3.1:8b
```

The provider layer is `src/lib/pana/providers.ts`. Every provider streams plain text, so the UI doesn't care which one is active.

## Repo layout

```
rooted/
├── docs/                  concept, persona, experience, metrics, data, architecture, stack
│   └── research/          sourced research briefs
├── src/
│   ├── app/               pages + API routes (api/pana = El Pana chat)
│   ├── data/              quest catalog, Alex persona, synthetic data
│   └── lib/
│       ├── pana/          El Pana prompt + provider layer
│       ├── recommend.ts   recommendation engine
│       ├── levels.ts      Seed → Sprout → Rooted → Grove
│       └── types.ts       shared types
└── .env.example
```
