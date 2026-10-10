# Who Leaves, and What Pay Keeps Them: Miami vs Austin
*Census microdata on tech workers moving in and out of Miami-Dade, plus a pay benchmark against Austin. Compiled 2026-10-10.*

**Main finding:** Miami-Dade tech workers leave at **about twice the rate** of the overall workforce (10.9% vs 5.2% a year), a net loss of about 1,300 a year. The loss is concentrated in **men aged 25-34**. On paper, Miami pays about the same as Austin, the top out-of-state destination. But Miami costs **16% more** (29% more for housing), so in real terms it pays **about 15-20% less**. To match Austin's purchasing power, Miami employers need to pay about **Austin x 1.16**, roughly 18-25% above today's Miami median.

---

## 0. Main pain points (sentiment summary)

These come from public commentary (news, Blind, founder and investor interviews). They are qualitative and roughly ranked. The ranking is a synthesis, not a coded sentiment analysis. See [why-engineers-leave.md](why-engineers-leave.md) for the sourced stats behind them.

| # | Pain point | What people say | Census and pay evidence below |
|---|---|---|---|
| 1 | **No next job in Miami** | "Career suicide"; "the opportunities are much bigger outside." Few senior or big-tech roles, so growing means moving | Leave rate peaks at ages 25-34 (15%) |
| 2 | **Pay doesn't cover costs** | High rent and insurance, middling pay | Miami pays like Austin but costs 16% more; leavers earn more than stayers |
| 3 | **The boom faded** | Crypto crash, a16z closed its Miami office (2024), VC fell from its 2022 peak | |
| 4 | **Thin tech community** | "Full of non-tech entrepreneurs"; few engineering peers or mentors | |
| 5 | **Remote workers have no ties** | Moved with a remote job; return-to-office mandates or layoffs end the stay | |
| 6 | **Daily life** | Traffic, heat, hurricanes, insurance. Rarely the first reason, often the last | |

The Census shows *who* leaves, not *why*. Tying reasons to sex and age needs a survey or exit interviews.

## 1. Who moves in and out (Census ACS PUMS, 2023 + 2024 pooled)

"Tech" = OCCP codes 0110 (IT managers), 1005-1108 (computer occupations) and 1240 (incl. data scientists). Adults 18+. Annual averages. Miami-Dade = 2020 PUMAs 08601-08625; "lived here a year ago" = MIGSP 12 + MIGPUMA 08626.

| | Residents | Moved in / yr | Moved out / yr | Net | Leave rate |
|---|---|---|---|---|---|
| **Tech workers** | 41,600 | 3,400 | 4,700 | **-1,300** | **10.9%** |
| All workers | 1.70M | 82,400 | 87,900 | -5,400 | 5.2% |

| By sex | In | Out | Net | Leave rate |
|---|---|---|---|---|
| Men | 2,330 | 3,930 | **-1,600** | 12.0% |
| Women | 1,040 | 740 | +300 | 7.4% |

| By age | In | Out | Net | Leave rate |
|---|---|---|---|---|
| 18-24 | 450 | 570 | -120 | 22% |
| 25-34 | 1,300 | 1,910 | **-610** | 15% |
| 35-44 | 1,240 | 1,420 | -180 | 12% |
| 45-54 | 140 | 440 | -300 | 5% |
| 55+ | 230 | 330 | -90 | 6% |

- **Where leavers go:** other Florida counties about 1,500 (likely Broward and Palm Beach, so partly suburbanization), **Texas about 990**, Georgia 390, North Carolina 270, California 240, New York 210.
- **Where arrivals come from:** other US states 57%, abroad 27%, other Florida 17%.
- **Median wage:** leavers $86.5K, arrivals $85K, stayers $82K. People who leave earn more than people who stay.

> **Caveat:** these estimates rest on only about 63 surveyed arrivals and 71 surveyed departures. Read the totals and the sex and age splits as directional. Sex x age cells are too thin to use. The 2020-2024 5-year PUMS would give about 5x the sample.

## 2. Pay: Miami vs Austin (BLS OEWS May 2025, BEA RPP 2024)

Cost of living (BEA Regional Price Parities 2024): Miami metro **114.2**, Austin **98.1**, so Miami costs **1.164x** Austin. Housing: 155.6 vs 120.4 (**+29%**). Neither state has an income tax.

**Retention target = Austin wage x 1.164.**

| Role | Miami median | Target median | Miami 75th pct | Target 75th pct | Gap |
|---|---|---|---|---|---|
| IT / Eng Managers | $169.6K | **$206K** | $210.9K | **$257K** | ~21% |
| Software Developers | $132.7K | **$156K** | $165.7K | **$196K** | ~18% |
| Info Security Analysts | $125.3K | **$156K** | $149.5K | **$190K** | ~25% |
| Data Scientists | $127.5K | **$148K** | $154.9K | **$188K** | ~16-21% |
| Network Architects | $133.7K | **$156K** | $166.5K | **$194K** | ~16% |
| QA / Test Engineers | $100.1K | **$120K** | $128.2K | **$152K** | ~20% |
| Computer Systems Analysts | $103.7K | **$122K** | $129.7K | **$155K** | ~17% |
| Network / Sys Admins | $97.2K | **$122K** | $125.6K | **$154K** | ~25% |
| IT Support | $60.5K | **$72K** | $76.1K | **$91K** | ~19% |

Miami = Miami-Fort Lauderdale-West Palm Beach MSA. Web developers are suppressed for Miami, and web/UX designers are left out because the data looks noisy.

### What this means for employers
1. **Benchmark to the 75th percentile, not the median.** Leavers already earn above the median, so median pay retains the wrong people.
2. **Target the 25-34 renters.** They have the highest leave rate, and the 29% housing gap hits them hardest. A housing stipend may cost less than raising base pay for everyone.
3. **Security and sysadmin roles** have the largest gaps (~25%).
4. **Base only:** OEWS excludes bonus and equity. Austin's big-tech campuses (Apple, Tesla, Oracle, Google) likely widen the total-comp gap at senior levels. Use Levels.fyi to quantify that.

## How it feeds the app
`src/data/pay.ts` uses these OEWS numbers. Seniority maps to percentiles: junior = 25th, mid = median, senior = 75th, staff+ = 90th. Each row includes `austin` and `miamiTarget`. `miamiRemote` is an estimate (NYC x 0.85), because no public source exists.

## Sources
- Census ACS 1-year PUMS 2023 and 2024, national person files: <https://www2.census.gov/programs-surveys/acs/data/pums/>
- BLS OEWS May 2025, metropolitan areas: <https://www.bls.gov/oes/tables.htm>
- BEA Regional Price Parities by MSA, 2024: <https://apps.bea.gov/regional/zip/MARPP.zip>
- Analysis script: `scripts/miami_flows.py`
