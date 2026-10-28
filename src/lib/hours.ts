import type { OpeningHours } from "../data/clinic";
import { formatClock } from "./format";
import { atClinicTime, clinicDayOf, weekdayOf } from "./slots";

export const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Open now · until 10:00 PM" style status for the clinic. */
export function openStatus(hours: OpeningHours, now: Date): { open: boolean; label: string } {
  const today = clinicDayOf(now);
  for (const [open, close] of hours[weekdayOf(today)] ?? []) {
    const t = now.getTime();
    if (t < atClinicTime(today, open).getTime()) return { open: false, label: `Opens ${formatClock(open)} today` };
    if (t < atClinicTime(today, close).getTime()) return { open: true, label: `Open until ${formatClock(close)}` };
  }
  return { open: false, label: "Closed now · opens tomorrow" };
}

export function formatWindows(windows: [string, string][]): string {
  if (!windows.length) return "Closed";
  return windows.map(([o, c]) => `${formatClock(o)} – ${formatClock(c)}`).join(", ");
}
