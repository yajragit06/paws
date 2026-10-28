import { clinic } from "../data/clinic";

export function formatPrice(cents: number | null): string {
  if (cents == null) return "Price on request";
  const dollars = cents / 100;
  return `B$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: clinic.timeZone, ...opts });

const timeFmt = fmt({ hour: "numeric", minute: "2-digit", hour12: true });
const longDateFmt = fmt({ weekday: "long", day: "numeric", month: "long" });

export const formatTime = (d: Date) => timeFmt.format(d).toUpperCase();
export const formatLongDate = (d: Date) => longDateFmt.format(d);

/** "08:30" → "8:30 AM" without involving time zones. */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}
