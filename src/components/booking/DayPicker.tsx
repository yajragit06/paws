import type { ClinicDay } from "../../lib/slots";

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

export function DayPicker({ days, value, onChange }: { days: ClinicDay[]; value: ClinicDay | null; onChange: (d: ClinicDay) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Choose a day">
      {days.map((day) => {
        const date = new Date(`${day}T00:00:00Z`);
        const selected = day === value;
        return (
          <button
            key={day}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(day)}
            className={`flex h-[72px] w-[68px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border transition-colors ${
              selected ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"
            }`}
          >
            <span className={`text-xs font-medium ${selected ? "text-white/85" : "text-muted"}`}>{weekday.format(date)}</span>
            <span className="text-xl font-extrabold">{date.getUTCDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
