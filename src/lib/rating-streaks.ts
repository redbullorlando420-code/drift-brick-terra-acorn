export type RatingStreakSnapshot = {
  weekKey: string;
  thisWeek: number;
  weeklyGoal: number;
  weeklyStreak: number;
  nextReward: string;
  rewards: Array<{ label: string; earned: boolean; detail: string }>;
};

type RatingDay = { day: string; ids: string[] };
const KEY = "reelcase.rating-streaks.v1";
const GOAL_KEY = "reelcase.rating-weekly-goal.v1";
const DEFAULT_WEEKLY_GOAL = 5;
export const RATING_GOALS = [3, 5, 10] as const;

function weeklyGoal() {
  try {
    const saved = Number(localStorage.getItem(GOAL_KEY) ?? DEFAULT_WEEKLY_GOAL);
    return RATING_GOALS.includes(saved as typeof RATING_GOALS[number]) ? saved : DEFAULT_WEEKLY_GOAL;
  } catch { return DEFAULT_WEEKLY_GOAL; }
}

export function setRatingWeeklyGoal(goal: number) {
  if (!RATING_GOALS.includes(goal as typeof RATING_GOALS[number]) || typeof window === "undefined") return;
  try { localStorage.setItem(GOAL_KEY, String(goal)); } catch { /* keep the session default */ }
  window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}

function dayKey(at = new Date()) { return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`; }
function weekKey(at = new Date()) {
  const date = new Date(at);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
function read(): RatingDay[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((row): row is RatingDay => typeof row?.day === "string" && Array.isArray(row?.ids)).slice(-400) : [];
  } catch { return []; }
}
function write(days: RatingDay[]) { try { localStorage.setItem(KEY, JSON.stringify(days.slice(-400))); } catch { /* local rewards are optional */ } }

export function recordRatingForStreak(id: string, rating: number) {
  if (!id || rating < 1 || typeof window === "undefined") return;
  const days = read();
  const today = dayKey();
  const row = days.find((entry) => entry.day === today);
  if (row) { if (!row.ids.includes(id)) row.ids.push(id); }
  else days.push({ day: today, ids: [id] });
  write(days);
  window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}

export function getRatingStreakSnapshot(now = new Date()): RatingStreakSnapshot {
  const days = read();
  const weeklyGoalValue = weeklyGoal();
  const currentWeek = weekKey(now);
  const weekTotals = new Map<string, number>();
  for (const row of days) {
    const key = weekKey(new Date(`${row.day}T12:00:00`));
    weekTotals.set(key, (weekTotals.get(key) ?? 0) + new Set(row.ids).size);
  }
  const thisWeek = weekTotals.get(currentWeek) ?? 0;
  let weeklyStreak = 0;
  const cursor = new Date(now);
  while (true) {
    if ((weekTotals.get(weekKey(cursor)) ?? 0) < weeklyGoalValue) break;
    weeklyStreak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  const rewards = [
    { label: "First impression", earned: thisWeek >= 1, detail: "Rate one title this week." },
    { label: "Weekly curator", earned: thisWeek >= weeklyGoalValue, detail: `Rate ${weeklyGoalValue} distinct titles this week.` },
    { label: "Two-week rhythm", earned: weeklyStreak >= 2, detail: "Complete your weekly goal two weeks in a row." },
  ];
  const next = rewards.find((reward) => !reward.earned);
  return { weekKey: currentWeek, thisWeek, weeklyGoal: weeklyGoalValue, weeklyStreak, nextReward: next ? next.detail : "All current local rewards earned.", rewards };
}
