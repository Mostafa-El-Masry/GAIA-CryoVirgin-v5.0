// Supabase helpers for Academy monthly calendar.
// This file does NOT import Supabase directly, so it is safe even if you
// don't have Supabase wired yet. You just pass in your existing client.
//
// Suggested Supabase table (run this SQL in your Supabase project):
//

//
// You can then upsert one month at a time using the helpers below.

export type TrackId = "programming" | "accounting" | "self-repair";

export type AcademyCalendarRow = {
  date: string; // YYYY-MM-DD
  track_id: TrackId | null;
  minutes: number;
  is_rest_day: boolean;
};

/**
 * Build calendar rows for a given month using your existing schedule logic.
 *
 * You must pass a function that, given a Date, returns the
 * trackId + minutes for that date (your rotation logic).
 *
 * Example usage elsewhere:
 *
 *   import { buildCalendarRowsForMonth } from "./supabaseCalendar";
 *   import { getScheduleForDate } from "../schedule"; // your logic
 *
 *   const rows = buildCalendarRowsForMonth(2026, 0, getScheduleForDate);
 */
export function buildCalendarRowsForMonth(
  year: number,
  month: number, // 0-based JS month: 0 = Jan, 11 = Dec
  getScheduleForDate: (date: Date) => { trackId: TrackId; minutes: number }
): AcademyCalendarRow[] {
  const monthStart = new Date(year, month, 1);
  monthStart.setHours(0, 0, 0, 0);
  const nextMonthStart = new Date(year, month + 1, 1);
  nextMonthStart.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysInMonth = Math.round(
    (Number(nextMonthStart) - Number(monthStart)) / msPerDay
  );

  const rows: AcademyCalendarRow[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month, i + 1);
    d.setHours(0, 0, 0, 0);

    const { trackId, minutes } = getScheduleForDate(d);
    const iso = isoFromDate(d);
    const is_rest_day = minutes <= 0;

    rows.push({
      date: iso,
      track_id: is_rest_day ? null : trackId,
      minutes: minutes,
      is_rest_day,
    });
  }

  return rows;
}

/**
 * Helper to format a Date into YYYY-MM-DD (same as we used elsewhere).
 */
export function isoFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Upsert one or more calendar rows into Supabase.
 *
 * You must pass your own Supabase client instance (browser or server).
 * The client is typed as `any` here so this file doesn't depend on your
 * specific Supabase setup.
 *
 * Example usage (client-side), assuming you have a helper:
 *
 *   const supabase = createClientComponentClient<Database>();
 *   await upsertCalendarRows(supabase, rows);
 */
export async function upsertCalendarRows(
  client: any,
  rows: AcademyCalendarRow[]
): Promise<void> {
  if (!client || typeof client.from !== "function") {
    throw new Error(
      "Supabase client is missing or invalid. Pass your Supabase client into upsertCalendarRows()."
    );
  }

  if (!rows.length) return;

  const { error } = await client
    .from("academy_calendar")
    .upsert(rows, { onConflict: "date" });

  if (error) {
    // You can replace this with your own error handling / logging.
    console.error("Failed to upsert academy_calendar rows:", error);
    throw error;
  }
}
