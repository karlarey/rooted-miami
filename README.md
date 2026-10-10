# Rooted 🌱

**Your journey to becoming a Miamian, one side quest at a time.**

Rooted is an AI-powered platform for building belonging in a new city. It starts with Miami (**Rooted Miami**) and the people the city attracts but doesn't keep.

> Built for the **Brain Gain** track: *Miami is a magnet for talent. How does it keep the talent it attracts?*
> The test: *Would one specific person choose to stay because of it?*

## The idea in 30 seconds

Engineers relocate to Miami for opportunity, but they live *alongside* the city, not *within* it. With no roots, they leave at the first shock: a layoff, a lease renewal, friends moving away. Meanwhile local students can't break into tech without a network.

Miami will never be cheap, and neither is New York, but people stay there for **opportunity** and **belonging**. Rooted builds both, as a **two-sided platform**:

1. **Engineers stay for the experience:** community, purpose, identity, and a career path here.
2. **Companies come to Miami and get staffed with the best engineers:** a rooted, committed, opt-in talent pool.

More rooted engineers attract more companies; more companies give engineers more reasons to stay.

Every newcomer gets a **welcome package**:

| | | |
|---|---|---|
| 🤝 | **Community** | Recurring rituals (tennis, run clubs, salsa, volleyball) that outlast the people who come and go |
| 🎓 | **Purpose** | A designed mentorship program with FIU / MDC / UM students, plus nonprofit matching |
| 🌴 | **Identity** | Welcomed by those who came before, then welcoming the next ones: *"I'm a Miamian."* |
| 💼 | **Career** | Miami tech map, warm intros through your community, senior peer circles, founder path |
| 🧭 | **Practical start** | Neighborhood fit, transit alternatives, cost heads-up |

Delivered as a **game**: side quests, levels (🌱 Seed → 🌿 Sprout → 🌳 Rooted → 🌲 Grove), and **El Pana**, an AI buddy you can chat or text who shows up *before* you think about leaving.

## Docs

| Doc | What's in it |
|---|---|
| [Concept](docs/concept.md) | Problem, insight, welcome package, levels, El Pana, recommendation engine |
| [Persona: Alex](docs/persona-alex.md) | Primary persona + fast-follower personas |
| [Experience](docs/experience.md) | Alex's first 12 months, moment by moment |
| [Metrics](docs/metrics.md) | Retention, life satisfaction, Miami growth, communities |
| [Data sources](docs/data-sources.md) | Evidence, sentiment data, data that powers the demo |
| [Architecture](docs/architecture.md) | Components, flows, data model, privacy |
| [Tech stack](docs/tech-stack.md) | What we use and why; switching El Pana's provider |
| [Research: why engineers leave](docs/research/why-engineers-leave.md) | Sourced stats |
| [Research: what already exists](docs/research/existing-resources.md) | Miami resources and gaps |
| [Research: pay and migration](docs/research/pay-and-migration.md) | Census in/out flows by sex and age; Miami vs Austin pay targets |

## Run it

```bash
npm install
cp .env.example .env.local   # set PANA_PROVIDER=gemini + GEMINI_API_KEY, or ollama, or leave mock
npm run dev                  # http://localhost:3000
```
