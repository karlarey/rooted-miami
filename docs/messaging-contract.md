# Company → engineer messaging (shared contract)

Companies reach Miami engineers **directly in Rooted**, instead of through LinkedIn. Engineers bring their own LinkedIn info (PDF import or Sign in with LinkedIn) and choose what companies see.

- **Companies side (Talent Finder):** search opted-in engineers, send the first message
- **Engineer side (El Pana):** opportunities inbox, reply or pass, visibility settings

## Rules
0. One account can hold both profiles: `roles: ("engineer" | "company")[]` on `user_data` (see `src/db/schema.ts`). An engineer's private data (check-ins, wellbeing, journey) is never visible from their own company profile.
1. Only engineers with `visibility.openToMessages = true` appear in Talent Finder and can be messaged.
2. **The first message must include role, pay band (min–max, USD base) and work mode.** No band, no send.
3. Before the engineer replies, the company sees only the fields the engineer chose to share. No contact info, ever, unless the engineer shares it in the chat.
4. Engineer can **pass** (company sees "Not right now"), **reply** (opens a direct thread) or **block** the company.
5. Rate limits: a company can start at most N new threads per week (config, default 20); an engineer can pause messages anytime.
6. Talent Finder must exclude engineers whose `hiddenFrom` includes the searching company's name (case-insensitive).
7. Companies never see wellbeing, check-in or intent-to-stay data.
8. We never collect LinkedIn data ourselves; only what the engineer imports and approves.

## Shapes

```ts
type Stack = "backend" | "frontend" | "fullstack" | "data-ml" | "mobile" | "devops" | "security" | "product";
type Seniority = "junior" | "mid" | "senior" | "staff";

/** What the engineer controls. */
interface EngineerVisibility {
  engineerId: string;
  openToMessages: boolean;
  paused: boolean;                 // temporary pause without losing settings
  shareName: boolean;              // otherwise shown as e.g. "Senior backend engineer, Brickell"
  hiddenFrom: string[];            // company names that must never find or message this engineer
  shared: {                        // fields companies may see
    stack: Stack;
    seniority: Seniority;
    skills: string[];
    headline?: string;             // from LinkedIn import, editable
    neighborhood?: string;
    workModes: ("office" | "hybrid" | "remote")[];
  };
}

/** The first message from a company. */
interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  engineerId: string;
  role: string;
  stack: Stack;
  seniority: Seniority;
  payMin: number;                  // required
  payMax: number;                  // required, >= payMin
  workMode: "office" | "hybrid" | "remote";
  neighborhood?: string;           // office location
  message: string;                 // the company's note, <= 1000 chars
  createdAt: string;               // ISO
  status: "new" | "replied" | "passed" | "blocked";
}

/** After the engineer replies, a direct thread. */
interface ThreadMessage {
  id: string;
  opportunityId: string;
  from: "company" | "engineer";
  body: string;
  createdAt: string;
}
```

## Endpoints (for the backend)
| Method | Path | Who | Purpose |
|---|---|---|---|
| `GET` | `/api/talent/search?stack=&seniority=&skills=` | Company | Opted-in engineers, shared fields only |
| `POST` | `/api/opportunities` | Company | Send the first message (validates band, rate limit) |
| `GET` | `/api/opportunities?status=` | Engineer / Company | Inbox / sent list |
| `PATCH` | `/api/opportunities/:id` | Engineer | `{ status: "passed" \| "blocked" }` |
| `GET` / `POST` | `/api/opportunities/:id/messages` | Both | Direct thread |
| `GET` / `PATCH` | `/api/me/visibility` | Engineer | Visibility settings |

## El Pana's role
El Pana announces new opportunities and compares the band with the engineer's numbers from "Know your number" (`negotiationRange` in `src/lib/pay-math.ts`): *"A Wynwood fintech wants to talk about a senior backend role at $160–180K. That's above your target. Want to reply?"*
