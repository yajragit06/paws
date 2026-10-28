import { clinic, type OpeningHours } from "../data/clinic";

// Brunei has no daylight saving, so a fixed +08:00 offset is exact.
const OFFSET_MS = 8 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/** A calendar day in clinic time, as "YYYY-MM-DD". */
export type ClinicDay = string;

export type Range = { start: Date; end: Date };

/** The clinic-local calendar day that `d` falls on. */
export function clinicDayOf(d: Date): ClinicDay {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function weekdayOf(day: ClinicDay): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

/** The instant at `hhmm` clinic time on `day`. */
export function atClinicTime(day: ClinicDay, hhmm: string): Date {
  return new Date(`${day}T${hhmm}:00${clinic.utcOffset}`);
}

/** Next `count` days (starting today) that have opening hours. */
export function upcomingOpenDays(hours: OpeningHours, now: Date, count: number, closures: ClinicDay[] = []): ClinicDay[] {
  const days: ClinicDay[] = [];
  const start = new Date(`${clinicDayOf(now)}T00:00:00Z`);
  for (let i = 0; days.length < count && i < count * 3; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * MINUTE).toISOString().slice(0, 10);
    if ((hours[weekdayOf(day)] ?? []).length && !closures.includes(day)) days.push(day);
  }
  return days;
}

export type SlotOptions = {
  hours: OpeningHours;
  day: ClinicDay;
  durationMin: number;
  now: Date;
  /** Existing bookings that day. */
  booked?: Range[];
  /** How many appointments can run at the same time. */
  capacity?: number;
  stepMin?: number;
  /** Minimum notice before a slot can be booked. */
  leadMin?: number;
};

/**
 * Start times on `day` where an appointment of `durationMin` fits inside an
 * opening window, starts at least `leadMin` from now, and overlaps fewer than
 * `capacity` existing bookings. The server re-checks at insert time.
 */
export function availableSlots({
  hours,
  day,
  durationMin,
  now,
  booked = [],
  capacity = 1,
  stepMin = 30,
  leadMin = 60,
}: SlotOptions): Date[] {
  const earliest = now.getTime() + leadMin * MINUTE;
  const slots: Date[] = [];
  for (const [open, close] of hours[weekdayOf(day)] ?? []) {
    const closeAt = atClinicTime(day, close).getTime();
    for (let t = atClinicTime(day, open).getTime(); t + durationMin * MINUTE <= closeAt; t += stepMin * MINUTE) {
      if (t < earliest) continue;
      const end = t + durationMin * MINUTE;
      const overlapping = booked.filter((b) => b.start.getTime() < end && b.end.getTime() > t).length;
      if (overlapping < capacity) slots.push(new Date(t));
    }
  }
  return slots;
}
