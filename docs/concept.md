# Rooted: concept

## Problem statement

> Miami attracts engineers from everywhere, but it doesn't turn them into locals. Newcomers live alongside the city, not within it. They never feel they belong or that anyone here needs them, so they leave at the first cost or career shock. We've watched our friends do it. Meanwhile local students struggle to break into tech without a network.

**Evidence** (see [research](research/why-engineers-leave.md)):
- ~73K net domestic out-migration from Miami-Dade in 2025, the most of any Florida county (UF Shimberg, Jul 2026)
- 51.8% of childless 18–34s in Miami likely to leave, #3 of 27 metros (Gensler City Pulse, 2024)
- Miami ranks bottom 3 of major US cities for volunteering and civic ties (AmeriCorps/Census, 2023)
- Attachment to place is driven more by social offerings and openness than by jobs (Knight/Gallup *Soul of the Community*)
- Nothing in Miami follows newcomers after arrival, and there's no easy way for an individual engineer to mentor local students ([existing resources](research/existing-resources.md))

## Core insight

Miami will never be cheap. Neither is New York, and people stay there anyway, for two reasons: **opportunity** (there's always a next job) and **belonging** ("I'm a New Yorker"). Miami is missing both for tech newcomers. We can't control affordability, so Rooted builds the two things we can.

Why engineers leave, in order (see [research](research/why-engineers-leave.md)): no next job in Miami, pay vs. cost, the 2021 boom faded, a thin engineering community, remote workers with no ties, and daily life (traffic, heat, hurricanes, insurance) settling the decision.

## Strategy: a two-sided platform

```
        ENGINEERS                                   COMPANIES
  Stay for the experience               Come to Miami because the talent is here
  (community · purpose · identity)        and get staffed with the best engineers
              │                                         ▲
              └──── rooted, committed talent pool ──────┘
              ▲                                         │
              └────── more jobs = more reasons to stay ─┘
```

| | Engineers | Companies |
|---|---|---|
| **Problem** | No roots, no next job, so they leave | Can't find senior talent in Miami; relocated hires leave |
| **Rooted gives** | The experience: welcome package, side quests, El Pana, community, purpose | Talent access (a rooted, committed engineer pool) + retention for the people they relocate |
| **Pays?** | Free | Yes: hiring access + retention packages (the business model) |
| **Partners** | FIU, MDC, UM, nonprofits | Beacon Council, Talent Bridge Miami, employers |

**How Rooted brings jobs here**
| Lever | How it works |
|---|---|
| Talent signal | Aggregated, opt-in talent map ("1,200 senior engineers rooted here, by stack") that the Beacon Council / Talent Bridge Miami use to recruit companies |
| Hidden job network | Rituals and mentor cohorts become warm referrals |
| Keep remote jobs local | Match remote workers with remote-first companies that hire people living in Miami |
| Founder path (Grove) | Connect to Miami accelerators and funders; founders hire mentees |
| Employers pay for retention | Companies that relocate engineers pay Rooted to keep them; replacing an engineer costs far more |

**Growing skills here (what makes companies want to hire in Miami)**
| Path | What it is | Value exchange |
|---|---|---|
| AI trainings | Hands-on build trainings with other Miami engineers | Current skills companies hire for |
| Hackathons | Weekend builds (like this one), then ship the project | Portfolio, teammates, companies scouting |
| Contribution projects | Side projects with university research (climate, sea level, hurricanes, health), civic open data, nonprofits | **Not free labor:** credit (co-author / contributor), a mentor, a portfolio piece, recommendations, sometimes a stipend or paid follow-on |

**Trust rule:** engineers opt in to being visible to companies, and the experience never feels like a recruiting funnel. Belonging comes first; jobs come through it.

## The engineer experience

We give newcomers to Miami a **welcome package** on arrival: a community that stays even as people come and go, a purpose that outlasts life's changes, an identity (*"I'm a Miamian"*), and a career path here.

## The welcome package

| Item | What the newcomer gets |
|---|---|
| 🤝 **Community** | Matched to **recurring** local rituals near home: tennis (Crandon Park, public courts), pickleball, padel, run clubs, group rides, beach volleyball, paddleboarding, rec soccer, salsa, dominoes. Mixed locals + newcomers. |
| 🎓 **Purpose** | **Path A:** a designed mentorship program (2 hrs/month × 6 months with FIU / MDC / UM students). **Path B:** nonprofit matching by cause and skill (education, climate, community, skills-based volunteering). |
| 🌴 **Identity** | Welcomed in by Hosts who came before; later becomes a Host. |
| 💼 **Career** | A map of Miami tech companies by stack and seniority, warm intros through your community, senior peer circles, the founder path. |
| 🧭 **Practical start** | Neighborhood fit, transit (Metromover, Metrorail, Brightline, Freebee, Citi Bike, trolleys), and a heads-up on costs (insurance, flood zone) so nothing blindsides you. We don't try to fix affordability. |

## The game: one side quest at a time

**Main quest:** become a Miamian. **Side quests:** small, concrete, real-world steps.

| Level | Milestone | Earned by |
|---|---|---|
| 🌱 **Seed** | Discovering | Picked a neighborhood, explored 3+ areas, got around once without a car |
| 🌿 **Sprout** | Routines and connections | Recurring ritual 4+ weeks; 2+ people outside work to call |
| 🌳 **Rooted** | Belonging | Belonging score up; "I'm a Miamian: Yes"; active mentoring or volunteering |
| 🌲 **Grove** | Contributing | Welcomed newcomers, created a community, mentees placed |

**Design rules**
1. Real rewards, not points. Levels mark real life milestones.
2. Every interaction ends with a real-world action. Get people *off* the app.
3. Nothing is a form; it's a conversation.
4. Accountability comes in three layers: self → each other → someone who needs you.

## El Pana: the AI buddy

*Pana*: Caribbean Spanish (Puerto Rico, Venezuela, DR) for buddy.

- **Chat or text.** A warm, bilingual Miami local, not a corporate bot.
- **Quest guide, local expert, connector, mentor coordinator, check-in coach.**
- **Proactive:** steps in at risk moments (3 weeks quiet, lease renewal, coworker leaves, layoff) *before* the decision to leave.
- **Guardrails:** points to human help (988) on real distress; opt-in sharing; intent-to-leave data stays private; human-first.

## Talent Finder: the companies' agent

El Pana is the engineer's buddy; Talent Finder is the company's partner. (Not named after LinkedIn: we're not affiliated, and we never use scraped LinkedIn data.)

- **Find talent:** "I need 3 senior backend engineers" → matching opted-in engineers from the talent map (aggregates first, intros only with consent).
- **Pay check:** uses `competitiveness()` in `src/lib/pay-math.ts`, the same numbers engineers see in "Know your number."
- **Write the job post:** a fair, transparent pay band, plus why Miami and why your team. Can be shared to LinkedIn.
- **Community presence:** co-host a hackathon or AI training, sponsor a ritual, mentor students.
- **Retention:** enroll relocated hires in the Rooted welcome package and El Pana.
- **Guardrails:** never sees wellbeing or intent-to-stay data; helps companies compete on pay, never lower it.

## Recommendation engine

- **Based on you:** onboarding conversation → background, life situation, interests, goals, time.
- **Engineers like you:** what similar newcomers who *stayed* did (anonymized, aggregated).
- **Optimizes for retention and wellbeing, not clicks.**
- **Matches people too:** quest party, Host/guide, mentee, nonprofit.
- **Explains itself:** "3 NYC engineers play in this ladder, 15 min from Brickell."
- **Cold start:** seeded from our survey/interview data + synthetic profiles.

## Brand system

| | |
|---|---|
| Platform | **Rooted** |
| First city | **Rooted Miami** (repeatable playbook for any city losing talent) |
| Agent | **El Pana** |
| Levels | Seed → Sprout → Rooted → Grove |
| Pitch story | From nomad to Miamian |

**Pitch framing:** lead with *keeping people in Miami*. Portability ("rooted" skills carry to the next city) is a vision slide, not the headline.

## Open items
- [ ] Interviews with friends who left + transplant survey (primary evidence)
- [ ] Trademark / app store / domain check for "Rooted"
- [ ] Verify uncertain resources (Venture Miami, The LAB, Code for Miami, PyMiami, Miami Hack Week)
