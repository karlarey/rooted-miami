import type { SyntheticMember } from "@/data/synthetic-members";
import { levelOrder } from "./levels";
import type { CheckIn, LevelId } from "./types";

/**
 * Pure aggregate functions behind the city dashboard (docs/metrics.md).
 * Input: member records. Output: plain numbers. No I/O, no randomness, so
 * the backend can run the same logic server-side over real records.
 */

/**
 * PLACEHOLDER: estimated dollar value of one volunteer hour, as published by
 * Independent Sector ("Value of Volunteer Time"). TODO: verify the current
 * national figure at independentsector.org before showing this to anyone.
 */
export const VOLUNTEER_HOUR_VALUE = 34.79;
export const VOLUNTEER_HOUR_VALUE_SOURCE = "Independent Sector, Value of Volunteer Time (placeholder, verify current figure)";

export type MemberRecord = SyntheticMember;

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (num: number, den: number) => (den ? num / den : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const isActive = (m: MemberRecord) => m.leftMonth === undefined;
const first = (m: MemberRecord): CheckIn | undefined => m.checkIns[0];
const latest = (m: MemberRecord): CheckIn | undefined => m.checkIns[m.checkIns.length - 1];

/* ---------- 1. Retention ---------- */

export interface IntentPoint {
  month: number;
  avg: number;
  n: number;
}

/** Average intent to stay (0–10) by months since joining, over members who checked in that month. */
export function intentByMonth(members: MemberRecord[], maxMonth = 12): IntentPoint[] {
  const out: IntentPoint[] = [];
  for (let month = 0; month <= maxMonth; month++) {
    const vals = members.flatMap((m) => m.checkIns.filter((c) => c.month === month).map((c) => c.intentToStay));
    if (vals.length) out.push({ month, avg: avg(vals), n: vals.length });
  }
  return out;
}

export interface RetentionMetrics {
  intent: IntentPoint[];
  /** Members observed 12+ months (or who left before 12): the 12-month cohort. */
  cohort12: number;
  retained12: number;
  retention12: number;
  shocked: number;
  weatheredShock: number;
  weatheredShockRate: number;
  graduatedMentees: number;
  menteesStayed: number;
  menteeRetention: number;
}

export function retentionMetrics(members: MemberRecord[]): RetentionMetrics {
  // Eligible for 12-month retention: tracked 12+ months, or left before month 12.
  const cohort = members.filter((m) => m.monthsTracked >= 12 || (m.leftMonth !== undefined && m.leftMonth < 12));
  const retained = cohort.filter((m) => m.leftMonth === undefined || m.leftMonth >= 12);

  const shocked = members.filter((m) => m.shock);
  const weathered = shocked.filter(isActive);

  const graduated = members.flatMap((m) => m.mentees).filter((s) => s.graduated);
  const stayed = graduated.filter((s) => s.stillInMiami);

  return {
    intent: intentByMonth(members),
    cohort12: cohort.length,
    retained12: retained.length,
    retention12: pct(retained.length, cohort.length),
    shocked: shocked.length,
    weatheredShock: weathered.length,
    weatheredShockRate: pct(weathered.length, shocked.length),
    graduatedMentees: graduated.length,
    menteesStayed: stayed.length,
    menteeRetention: pct(stayed.length, graduated.length),
  };
}

/* ---------- 2. Life satisfaction ---------- */

export interface SatisfactionMetrics {
  /** Over active members: latest check-in vs. their first. */
  members: number;
  cantril: number;
  cantrilAtJoin: number;
  belonging: number;
  belongingAtJoin: number;
  peopleOutsideWork: number;
  peopleOutsideWorkAtJoin: number;
  miamianYes: number;
  miamianYesAtJoin: number;
}

export function satisfactionMetrics(members: MemberRecord[]): SatisfactionMetrics {
  const active = members.filter((m) => isActive(m) && m.checkIns.length > 0);
  const now = active.map(latest) as CheckIn[];
  const then = active.map(first) as CheckIn[];
  return {
    members: active.length,
    cantril: avg(now.map((c) => c.lifeSatisfaction)),
    cantrilAtJoin: avg(then.map((c) => c.lifeSatisfaction)),
    belonging: avg(now.map((c) => c.belonging)),
    belongingAtJoin: avg(then.map((c) => c.belonging)),
    peopleOutsideWork: avg(now.map((c) => c.peopleOutsideWork)),
    peopleOutsideWorkAtJoin: avg(then.map((c) => c.peopleOutsideWork)),
    miamianYes: pct(now.filter((c) => c.miamian === "yes").length, now.length),
    miamianYesAtJoin: pct(then.filter((c) => c.miamian === "yes").length, then.length),
  };
}

/* ---------- 3. Miami growth ---------- */

export interface GrowthMetrics {
  engineersKept: number;
  studentsKept: number;
  talentKept: number;
  menteeInternships: number;
  menteeJobs: number;
  volunteerHours: number;
  volunteerValue: number;
  startupsFounded: number;
  localHires: number;
}

export function growthMetrics(members: MemberRecord[], hourValue = VOLUNTEER_HOUR_VALUE): GrowthMetrics {
  const mentees = members.flatMap((m) => m.mentees);
  const engineersKept = members.filter(isActive).length;
  const studentsKept = mentees.filter((s) => s.graduated && s.stillInMiami).length;
  const volunteerHours = sum(members.map((m) => m.volunteerHours));
  return {
    engineersKept,
    studentsKept,
    talentKept: engineersKept + studentsKept,
    menteeInternships: mentees.filter((s) => s.outcome === "internship").length,
    menteeJobs: mentees.filter((s) => s.outcome === "job" && s.stillInMiami).length,
    volunteerHours,
    volunteerValue: volunteerHours * hourValue,
    startupsFounded: members.filter((m) => m.foundedStartup).length,
    localHires: sum(members.map((m) => m.localHires)),
  };
}

/* ---------- 4. Communities embraced and created ---------- */

export interface CommunityMetrics {
  communitiesJoined: number;
  avgCommunitiesPerMember: number;
  avgRitualMonths: number;
  withRitual: number;
  communitiesCreated: number;
  hosts: number;
  newcomersWelcomed: number;
}

export function communityMetrics(members: MemberRecord[]): CommunityMetrics {
  const withRitual = members.filter((m) => m.communities.length > 0);
  return {
    communitiesJoined: sum(members.map((m) => m.communities.length)),
    avgCommunitiesPerMember: avg(members.map((m) => m.communities.length)),
    avgRitualMonths: avg(withRitual.map((m) => m.ritualMonths)),
    withRitual: withRitual.length,
    communitiesCreated: sum(members.map((m) => m.communitiesCreated)),
    hosts: members.filter((m) => m.communitiesCreated > 0).length,
    newcomersWelcomed: sum(members.map((m) => m.newcomersWelcomed)),
  };
}

/* ---------- Levels ---------- */

export function membersByLevel(members: MemberRecord[]): { level: LevelId; count: number }[] {
  const active = members.filter(isActive);
  return levelOrder.map((level) => ({ level, count: active.filter((m) => m.level === level).length }));
}

/* ---------- Everything the dashboard needs ---------- */

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  retention: RetentionMetrics;
  satisfaction: SatisfactionMetrics;
  growth: GrowthMetrics;
  communities: CommunityMetrics;
  levels: { level: LevelId; count: number }[];
}

export function dashboardMetrics(members: MemberRecord[]): DashboardMetrics {
  return {
    totalMembers: members.length,
    activeMembers: members.filter(isActive).length,
    retention: retentionMetrics(members),
    satisfaction: satisfactionMetrics(members),
    growth: growthMetrics(members),
    communities: communityMetrics(members),
    levels: membersByLevel(members),
  };
}
