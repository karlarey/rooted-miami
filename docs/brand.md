# Rooted — Brand, Product & Design System

**Version:** 1.1 · **Launch market:** Miami · **Benchmark market:** Austin  
**Brand tagline:** New city. New roots.  
**Brand promise:** Where people and opportunity take root.

## 1. The vision

Rooted is an AI-powered platform that helps people relocate, discover their city, build community, and connect with opportunities. It also gives businesses a dedicated way to discover and connect with relevant talent.

**Product positioning:** More than relocation search: a platform for building a life in a new city.

- **B2C:** Find your roots.
- **B2B:** Find your talent.
- **AI companion:** Find your way.

### Pitch narrative

**From nomad to local, one side quest at a time.**

Moving is a logistical event; belonging is a longer journey. Rooted aims to support that journey while helping local employers discover professionals who want to build their futures in the city.

## 2. Product ecosystem

| Experience | Audience | AI agent | Core value |
|---|---|---|---|
| **Rooted for People** | Newcomers and prospective movers | **Pana** | Personalized relocation, neighborhood and lifestyle discovery, community integration |
| **Rooted for Business** | Employers and companies | **Talent Finder** | Browse talent, discover relevant profiles, and connect with professionals |

### Pana — AI local companion

Pana is the welcoming, culturally aware guide who helps people explore neighborhoods, discover local activities, establish routines, and find communities that match their preferences.

- Character: warm, witty, local, intelligent, helpful; not overly chatty.
- Miami voice: can naturally use local expressions such as *pana* and *¡wepa!* when appropriate, but adapts to the user's language and preferences.
- Example: “New to Miami? Don't worry, you have a Pana.”
- Example: “No tienes raíces todavía, pero tienes un Pana.”

### Talent Finder — AI talent discovery agent

Talent Finder supports the business-facing portal where companies browse and connect with talent.

Potential capabilities to validate and scope:

- Search and filter opted-in talent by skills, experience, interests, location, and relocation intent.
- Natural-language candidate discovery and relevance explanations.
- Employer-to-candidate introductions or outreach workflows.
- Talent availability and preferences that candidates explicitly choose to share.

**Privacy principle:** Candidate visibility and outreach should be consent-based. Do not expose private relocation details or infer protected characteristics for employment decisions. Talent Finder should support human hiring decisions, not make unreviewed consequential decisions.

### Two-sided network effects — hypothesis

More relevant talent may attract employers; more meaningful opportunities may attract movers and local professionals. This is a business hypothesis to validate, not an established outcome.

## 3. Launch and expansion

- **First launch:** Rooted Miami.
- **Benchmark:** Austin, for studying migration motivations, relocation friction, integration and community-building.
- **Potential expansion:** Rooted Austin, Rooted Chicago, and other cities.
- City-specific guides and local personalities can evolve while retaining a consistent Rooted design system.

### Research dimensions

1. **Why people move:** career, affordability, lifestyle, family, community, weather, and other motivations.
2. **Relocation friction:** housing, neighborhood selection, cost, transportation, and logistics.
3. **Belonging:** making friends, finding routines, professional networks, activities, and local culture.
4. **Employer needs:** talent discovery, matching quality, outreach friction, and relocation-ready candidates.

Use interviews and permitted public discussions for discovery; use structured surveys for quantitative validation. Segment prospective movers and recent arrivals rather than pooling them. Avoid presenting social-media frequencies as representative population estimates.

## 4. Brand identity

**Creative direction:** Botanical Tech — **70% sophisticated, 30% playful**.

The visual identity blends premium technology, organic warmth, and the excitement of discovering a new city. It should feel investor-ready without becoming cold, and adventurous without becoming childish.

**Core personality:** warm, intelligent, locally authentic, optimistic, adventurous, trustworthy.

### Brand lines

- **Rooted:** New city. New roots.
- **Rooted for People:** Find your roots.
- **Rooted for Business:** Find your talent.
- **Pana:** Your AI local companion.
- **Talent Finder:** Your AI talent discovery agent.
- **Ecosystem:** Where people and opportunity take root.
- **Campaign:** From nomad to local, one side quest at a time.
- **Playful:** New city. New roots. Same Pana.

## 5. Color palette

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--rooted-primary` | Forest Green | `#183D32` | Main brand color, headings, navigation, primary buttons |
| `--rooted-accent` | Fresh Lime | `#D9F36A` | Highlights, progress, accent buttons, badges |
| `--rooted-background` | Warm Cream | `#F8F6EF` | Main page backgrounds and presentation canvas |
| `--rooted-secondary` | Miami Coral | `#FF806B` | Playful moments, illustrations, select emphasis |
| `--rooted-sage` | Sage | `#86B5AB` | Secondary backgrounds, supporting illustrations |
| `--rooted-muted` | Muted Green | `#557166` | Supporting text, captions |
| `--rooted-white` | White | `#FFFFFF` | Cards, dark-theme text, high-contrast surfaces |

```css
:root {
  --rooted-primary: #183D32;
  --rooted-accent: #D9F36A;
  --rooted-background: #F8F6EF;
  --rooted-secondary: #FF806B;
  --rooted-sage: #86B5AB;
  --rooted-text: #183D32;
  --rooted-muted: #557166;
  --rooted-white: #FFFFFF;
}
```

**Usage:** Cream background + forest text for the main light theme. Forest background + white text for premium hero sections. Lime accents on forest green. Coral is a supporting highlight, not the default error color. Check contrast for every text/background combination; avoid small lime or coral text on cream.

## 6. Typography

**Fonts:** Sora for display and headings; Inter for interface and body text.

| Element | Font | Weight | Desktop | Mobile |
|---|---|---|---|---|
| Hero / display | Sora | Bold 700 | 48–64px | 32–40px |
| Section heading | Sora | Semibold 600 | 28–36px | 24–28px |
| Body | Inter | Regular 400 | 16px | 16px |
| Labels / buttons | Inter | Medium 500 | 12–14px | 12–14px |

- Body line-height: **1.5–1.6**.
- Use generous whitespace and clear hierarchy.
- Keep headings short and expressive; avoid dense pitch-deck paragraphs.

## 7. UI styling

| Component | Style |
|---|---|
| Buttons | Pill-shaped, `border-radius: 999px` |
| Primary CTA | Forest fill, white text |
| Accent CTA | Lime fill, forest text |
| Secondary CTA | Forest outline, transparent fill |
| Main cards | 20–24px radius, white surfaces, soft borders |
| Inputs | 12–16px radius |
| Small tags | Pill-shaped |
| Card padding | 20–24px |
| Grid gap | 16–24px |
| Spacing system | 8px base, 4px fine increments |
| Section spacing | 64–96px desktop; 40–56px mobile |
| Shadows | Soft, diffuse, low-opacity |
| Icons | Minimal Lucide-style line icons, ~1.75–2px stroke |
| Transitions | 180–300ms ease-out; respect reduced-motion preferences |

### Sample component CSS

```css
.rooted-card {
  background: var(--rooted-white);
  border: 1px solid #E2E7DF;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(24, 61, 50, 0.06);
}

.rooted-button-primary {
  background: var(--rooted-primary);
  color: var(--rooted-white);
  border: 0;
  border-radius: 999px;
  padding: 12px 22px;
  font: 500 14px/1.4 Inter, sans-serif;
}

.rooted-button-accent {
  background: var(--rooted-accent);
  color: var(--rooted-primary);
  border: 0;
  border-radius: 999px;
  padding: 12px 22px;
}
```

## 8. Photography and illustration

- **Botanical motifs:** seeds, sprouts, leaves, roots, growth rings, and subtle organic curves.
- **City photography:** real neighborhoods, warm street scenes, authentic local businesses, community spaces, and people doing things together.
- **Illustration:** minimal, geometric, optimistic, and warm; avoid generic stock-technology aesthetics.
- **Maps and discovery:** friendly pins, local context, editorial cards, and uncluttered layouts.
- **Avoid:** overly corporate real estate imagery, dense dashboards on consumer screens, and cartoon-heavy design.

## 9. Progression and gamification

| Level | Meaning | Potential visual treatment |
|---|---|---|
| **Seed** | Starting the journey | Seed icon, soft cream / pale green |
| **Sprout** | Exploring and building routines | Sprout icon, fresh lime |
| **Rooted** | Developing familiarity and belonging | Root / tree icon, sage |
| **Grove** | Contributing and helping newcomers | Grove / trees icon, coral accents |

Progression should reflect meaningful experiences, not arbitrary engagement. Examples include exploring a neighborhood, joining an activity, finding a regular spot, or voluntarily helping another newcomer. Avoid treating “never moving again” as the definition of success.

## 10. Presentation design specifications

- **Format:** 16:9 widescreen PowerPoint.
- **Hero slides:** forest green background, white display type, lime highlights.
- **Content slides:** warm cream canvas, forest titles, generous margins.
- **Accent slides:** restrained coral and sage for visual variation.
- **Graphics:** simple diagrams, clear iconography, product UI mockups, authentic city photos.
- **Charts:** forest as main series, sage as secondary, lime for key emphasis; label data sources and mark hypotheses clearly.
- **Layout:** one strong idea per slide; minimal text; visual hierarchy over decoration.

### Suggested pitch deck outline

1. **Rooted** — New city. New roots.
2. **The Problem** — Moving is easy. Belonging is hard.
3. **Customer Insights** — Why people move and what hurts (validated findings only).
4. **The Opportunity** — Connecting relocation, belonging, and talent.
5. **Rooted for People** — Personalized city discovery.
6. **Meet Pana** — Your AI local companion.
7. **The Journey** — Seed → Sprout → Rooted → Grove.
8. **Rooted for Business** — Employer talent discovery portal.
9. **Meet Talent Finder** — AI-assisted talent discovery and connections.
10. **Why Miami / Why Austin** — Launch city and comparative benchmark.
11. **Business Model** — Consumer and employer monetization hypotheses.
12. **The Vision** — Expand Rooted to new cities.

## 11. Product and UX principles

1. **Frictionless first:** conversational onboarding; avoid long forms.
2. **Personalized, not generic:** recommendations based on explicit preferences and feedback.
3. **Human belonging over engagement:** optimize for meaningful local outcomes.
4. **Trust and consent:** users control profile visibility and what is shared with employers.
5. **Local authenticity:** each city experience should reflect its culture.
6. **AI with purpose:** Pana guides city integration; Talent Finder helps employers discover relevant talent.
7. **Accessible by default:** readable contrast, keyboard support, visible focus states, and reduced motion.
8. **Explain recommendations:** let users understand and correct why an opportunity or place is suggested.

## 12. Brand handoff summary

> **Rooted** is a premium, warm, AI-powered ecosystem connecting people, cities, and opportunity. Rooted for People is guided by **Pana**, the local AI companion; Rooted for Business is supported by **Talent Finder**, the AI talent discovery agent. Launch in Miami, use Austin as a research benchmark, and scale to other cities. Design language: **Botanical Tech**, 70% sophisticated and 30% playful. Palette: Forest `#183D32`, Lime `#D9F36A`, Cream `#F8F6EF`, Coral `#FF806B`, Sage `#86B5AB`. Typography: Sora + Inter. Use rounded cards, pill CTAs, minimal botanical motifs, authentic city imagery, and purposeful gamification.

---

*Working brand and product specification. Proposed features, network effects, and monetization paths are hypotheses until validated. Verify trademarks and domain availability before launch.*
