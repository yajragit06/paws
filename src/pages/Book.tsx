import { CalendarPlus, Check, CircleCheck, MapPin, MessageCircle, PawPrint, Phone } from "lucide-react";
import { useMemo, useState, type ComponentProps, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bookableServices, clinic } from "../data/clinic";
import { useBookedRanges } from "../hooks/useBookedRanges";
import { useCatalogue } from "../hooks/useCatalogue";
import { formatDuration, formatLongDate, formatPrice, formatTime } from "../lib/format";
import { downloadIcs } from "../lib/ics";
import { availableSlots, upcomingOpenDays, type ClinicDay } from "../lib/slots";
import { supabase } from "../lib/supabase";
import { DayPicker } from "../components/booking/DayPicker";
import { TimeSlots } from "../components/booking/TimeSlots";
import { Button, ButtonLink } from "../components/ui/Button";
import { PetIllustration } from "../components/ui/PetIllustration";

const species = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

const errorMessages: Record<string, string> = {
  slot_taken: "Sorry, that time was just taken. Please pick another.",
  too_soon: "That time is too soon to book online. Please pick a later time or call us.",
  outside_hours: "That time is outside our opening hours. Please pick another.",
  clinic_closed: "We're closed that day. Please pick another day.",
  service_unavailable: "That service can't be booked online. Please call us.",
};

type Confirmed = { reference: string; start: Date; end: Date };

export default function Book() {
  const { services, hours, closures, capacity, leadMin } = useCatalogue();
  const bookable = services.filter((s) => s.bookable);
  const [params, setParams] = useSearchParams();
  const service = bookable.find((s) => s.slug === params.get("service")) ?? bookable[0] ?? bookableServices[0];

  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => upcomingOpenDays(hours, now, 14, closures), [hours, now, closures]);
  // Start on the first day that still has times left (today may be nearly over).
  const firstDay = days.find((day) => availableSlots({ hours, day, durationMin: service.durationMin, now, leadMin }).length) ?? days[0];
  const [pickedDay, setPickedDay] = useState<ClinicDay | null>(null);
  const day = pickedDay && days.includes(pickedDay) ? pickedDay : firstDay;

  const [version, setVersion] = useState(0);
  const { ranges, loading } = useBookedRanges(day, version);
  const slots = day ? availableSlots({ hours, day, durationMin: service.durationMin, now, booked: ranges, capacity, leadMin }) : [];
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const slot = pickedSlot && slots.some((s) => s.toISOString() === pickedSlot) ? pickedSlot : null;

  const [form, setForm] = useState({ petName: "", petSpecies: "Dog", name: "", phone: "", email: "", notes: "" });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const month = day ? new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`)) : "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!slot) return setError("Please pick a time.");
    setError(null);
    const start = new Date(slot);

    if (!supabase) {
      // Online booking not connected yet: hand the request over on WhatsApp.
      const text = [
        `Hi Paws & Claws, I'd like to book: ${service.name}`,
        `When: ${formatLongDate(start)}, ${formatTime(start)}`,
        `Pet: ${form.petName} (${form.petSpecies})`,
        `Name: ${form.name}, ${form.phone}`,
        form.notes && `Notes: ${form.notes}`,
      ].filter(Boolean).join("\n");
      window.open(`${clinic.whatsappHref}?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
      return;
    }

    setSubmitting(true);
    const { data, error: rpcError } = await supabase.rpc("book_appointment", {
      p_service_slug: service.slug,
      p_starts_at: slot,
      p_owner_name: form.name,
      p_owner_phone: form.phone,
      p_owner_email: form.email,
      p_pet_name: form.petName,
      p_pet_species: form.petSpecies,
      p_notes: form.notes,
    });
    setSubmitting(false);

    if (rpcError) {
      const code = Object.keys(errorMessages).find((k) => rpcError.message.includes(k));
      setError(code ? errorMessages[code] : "Something went wrong. Please try again or call us.");
      if (code === "slot_taken") {
        setPickedSlot(null);
        setVersion((v) => v + 1);
      }
      return;
    }
    const row = (data as { reference: string; starts_at: string; ends_at: string }[])[0];
    setConfirmed({ reference: row.reference, start: new Date(row.starts_at), end: new Date(row.ends_at) });
    window.scrollTo(0, 0);
  }

  if (confirmed) {
    return (
      <div className="container-page max-w-xl py-16 text-center">
        <CircleCheck className="mx-auto size-14 text-brand" aria-hidden />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">You're booked in!</h1>
        <p className="mt-2 text-muted">
          We've received your request and will confirm by phone or email. Your reference is{" "}
          <b className="text-ink">{confirmed.reference}</b>.
        </p>
        <div className="card mt-8 p-6 text-left">
          <p className="font-bold">{service.name} for {form.petName}</p>
          <p className="mt-1 text-muted">{formatLongDate(confirmed.start)} · {formatTime(confirmed.start)}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-4" /> {clinic.address[0]}, Kiulap</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              downloadIcs({
                uid: confirmed.reference,
                title: `${service.name} for ${form.petName} at Paws & Claws`,
                start: confirmed.start,
                end: confirmed.end,
                description: `Booking reference ${confirmed.reference}. Call ${clinic.phone} to change.`,
              })
            }
          >
            <CalendarPlus className="size-4" /> Add to calendar
          </Button>
          <ButtonLink to="/my-bookings">My bookings</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 pt-6 pb-16 sm:pt-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      {/* Summary column, after the reference design */}
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="card flex items-center gap-4 p-5">
          <p className="text-3xl font-extrabold tracking-tight whitespace-nowrap">
            {service.priceCents == null ? formatDuration(service.durationMin) : formatPrice(service.priceCents)}
          </p>
          <div className="min-w-0 flex-1 border-l border-line pl-4 text-sm">
            <p className="truncate text-muted">
              {service.name}
              {service.priceCents != null && ` · ${formatDuration(service.durationMin)}`}
            </p>
            <p className="font-semibold text-brand-dark">
              {service.priceCents == null ? "Price confirmed at the clinic" : "Pay at the clinic"}
            </p>
          </div>
        </div>
        <div className="card relative mt-4 hidden overflow-hidden p-0 md:block">
          <PetIllustration className="block h-auto w-full" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold shadow-card">
            <PawPrint className="size-4 text-brand" aria-hidden /> For {form.petName.trim() || "your pet"}
          </span>
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold shadow-card">
            <MapPin className="size-4 text-brand" aria-hidden /> Kiulap
          </span>
        </div>
      </aside>

      <form onSubmit={submit} className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{service.name}</h1>
        <p className="mt-2 text-muted">{service.description}</p>

        <fieldset className="mt-6 min-w-0">
          <legend className="sr-only">Service</legend>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {bookable.map((s) => (
              <button
                key={s.slug}
                type="button"
                aria-pressed={s.slug === service.slug}
                onClick={() => setParams({ service: s.slug }, { replace: true })}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  s.slug === service.slug ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-surface text-muted hover:border-brand"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Choose a day</h2>
            <span className="text-sm text-muted">{month}</span>
          </div>
          <div className="mt-3">
            <DayPicker days={days} value={day} onChange={(d) => { setPickedDay(d); setPickedSlot(null); }} />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Pick a time</h2>
            <span className="text-sm text-muted">{loading ? "Checking…" : `${slots.length} slots left`}</span>
          </div>
          <div className="mt-3">
            {slots.length ? (
              <TimeSlots key={day} slots={slots} value={slot} onChange={setPickedSlot} />
            ) : (
              <p className="rounded-xl bg-brand-tint p-4 text-sm text-muted">No times left this day. Please choose another day.</p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-bold">Your details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Pet's name" value={form.petName} onChange={set("petName")} autoComplete="off" required maxLength={60} />
            <label className="block">
              <span className="text-sm font-medium text-muted">Pet type</span>
              <select value={form.petSpecies} onChange={set("petSpecies")} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3">
                {species.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <Field label="Your name" value={form.name} onChange={set("name")} autoComplete="name" required maxLength={120} />
            <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" required minLength={5} maxLength={30} placeholder="+673" />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required className="sm:col-span-2" />
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-muted">Anything we should know? (optional)</span>
              <textarea value={form.notes} onChange={set("notes")} rows={3} maxLength={1000} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2" />
            </label>
          </div>
        </section>

        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <Button type="submit" size="lg" className="w-full" disabled={!slot || submitting}>
            {!supabase && <MessageCircle className="size-5" />}
            {submitting
              ? "Booking…"
              : slot
                ? `${supabase ? "Book" : "Request on WhatsApp"} · ${formatTime(new Date(slot))}`
                : "Pick a time to continue"}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted">
            <Check className="size-4 text-brand" aria-hidden /> No payment needed now ·{" "}
            <a href={clinic.phoneHref} className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
              <Phone className="size-3.5" /> Emergency? Call us
            </a>
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already booked? <Link to="/my-bookings" className="font-semibold text-brand-dark hover:underline">View my bookings</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...props }: { label: string; className?: string } & ComponentProps<"input">) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-muted">{label}</span>
      <input {...props} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3" />
    </label>
  );
}
