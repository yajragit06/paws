import { useState } from "react";
import { formatTime } from "../../lib/format";

const parts = [
  { key: "morning", label: "Morning", from: 0, to: 12 },
  { key: "afternoon", label: "Afternoon", from: 12, to: 17 },
  { key: "evening", label: "Evening", from: 17, to: 24 },
] as const;

const clinicHour = (d: Date) => (d.getUTCHours() + 8) % 24;

export function TimeSlots({ slots, value, onChange }: { slots: Date[]; value: string | null; onChange: (iso: string) => void }) {
  const grouped = parts.map((p) => ({ ...p, slots: slots.filter((s) => clinicHour(s) >= p.from && clinicHour(s) < p.to) }));
  const firstWithSlots = grouped.find((g) => g.slots.length)?.key ?? "morning";
  const [chosen, setChosen] = useState<string | null>(null);
  // Fall back to the first part with times when the chosen part is empty (e.g. after changing day).
  const active = grouped.find((g) => g.key === chosen && g.slots.length)?.key ?? firstWithSlots;
  const current = grouped.find((g) => g.key === active)!;

  return (
    <div>
      <div className="inline-flex rounded-xl bg-brand-tint p-1" role="tablist" aria-label="Time of day">
        {grouped.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={g.key === active}
            disabled={!g.slots.length}
            onClick={() => setChosen(g.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
              g.key === active ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label={`${current.label} times`}>
        {current.slots.map((slot) => {
          const iso = slot.toISOString();
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(iso)}
              className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                selected ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"
              }`}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
