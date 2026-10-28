import { describe, expect, it } from "vitest";
import { openingHours } from "../data/clinic";
import { atClinicTime, availableSlots, clinicDayOf, upcomingOpenDays } from "./slots";

const hhmm = (d: Date) => new Date(d.getTime() + 8 * 3600_000).toISOString().slice(11, 16);

describe("clinicDayOf", () => {
  it("uses Brunei time, not UTC", () => {
    // 20:00 UTC on the 1st is 04:00 on the 2nd in Brunei.
    expect(clinicDayOf(new Date("2026-11-01T20:00:00Z"))).toBe("2026-11-02");
  });
});

describe("availableSlots", () => {
  const now = new Date("2026-11-01T00:00:00+08:00");

  it("fills the opening window and stops before closing", () => {
    const slots = availableSlots({ hours: openingHours, day: "2026-11-02", durationMin: 30, now });
    expect(hhmm(slots[0])).toBe("08:30");
    expect(hhmm(slots[slots.length - 1])).toBe("21:30");
  });

  it("skips the Friday prayer break", () => {
    const slots = availableSlots({ hours: openingHours, day: "2026-11-06", durationMin: 30, now }).map(hhmm);
    expect(slots).toContain("11:30");
    expect(slots).not.toContain("12:00");
    expect(slots).not.toContain("13:30");
    expect(slots).toContain("14:00");
  });

  it("respects lead time on the same day", () => {
    const morning = new Date("2026-11-02T10:10:00+08:00");
    const slots = availableSlots({ hours: openingHours, day: "2026-11-02", durationMin: 30, now: morning });
    expect(hhmm(slots[0])).toBe("11:30");
  });

  it("hides slots once capacity is reached", () => {
    const booked = [{ start: atClinicTime("2026-11-02", "09:00"), end: atClinicTime("2026-11-02", "09:30") }];
    const one = availableSlots({ hours: openingHours, day: "2026-11-02", durationMin: 30, now, booked }).map(hhmm);
    expect(one).not.toContain("09:00");
    expect(one).toContain("09:30");
    const two = availableSlots({ hours: openingHours, day: "2026-11-02", durationMin: 30, now, booked, capacity: 2 }).map(hhmm);
    expect(two).toContain("09:00");
  });
});

describe("upcomingOpenDays", () => {
  it("skips closures", () => {
    const now = new Date("2026-11-01T09:00:00+08:00");
    expect(upcomingOpenDays(openingHours, now, 3, ["2026-11-02"])).toEqual(["2026-11-01", "2026-11-03", "2026-11-04"]);
  });
});
