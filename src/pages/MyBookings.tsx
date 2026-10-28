import type { Session } from "@supabase/supabase-js";
import { CalendarX, LogOut, Mail, Phone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { clinic } from "../data/clinic";
import { useCatalogue } from "../hooks/useCatalogue";
import { formatLongDate, formatTime } from "../lib/format";
import { supabase } from "../lib/supabase";
import { Button, ButtonLink } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";

type Booking = {
  id: string;
  reference: string;
  service_slug: string;
  starts_at: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  pet_name: string;
};

const statusLabel: Record<Booking["status"], string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "Missed",
};

export default function MyBookings() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <>
      <PageHeader eyebrow="My bookings" title="Your visits" />
      <div className="container-page max-w-2xl">
        {!supabase ? (
          <div className="card p-6">
            <p className="text-muted">To check or change a booking, please call or message us.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink to={clinic.phoneHref}><Phone className="size-4" /> {clinic.phone}</ButtonLink>
              <ButtonLink to={clinic.whatsappHref} variant="secondary">WhatsApp</ButtonLink>
            </div>
          </div>
        ) : session === undefined ? null : session ? (
          <BookingList session={session} />
        ) : (
          <SignIn />
        )}
      </div>
    </>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/my-bookings` },
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="card p-6 text-center">
        <Mail className="mx-auto size-10 text-brand" aria-hidden />
        <p className="mt-3 font-bold">Check your inbox</p>
        <p className="mt-1 text-muted">We sent a sign-in link to {email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="card p-6">
      <p className="text-muted">Enter the email you booked with and we'll send you a sign-in link. No password needed.</p>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-muted">Email</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3" />
      </label>
      {state === "error" && <p role="alert" className="mt-3 text-sm text-red-700">Couldn't send the link. Please try again.</p>}
      <Button type="submit" className="mt-4 w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}

function BookingList({ session }: { session: Session }) {
  const { services } = useCatalogue();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    supabase!
      .from("bookings")
      .select("id, reference, service_slug, starts_at, status, pet_name")
      .order("starts_at", { ascending: false })
      .then(({ data }) => setBookings((data as Booking[]) ?? []));
  }, [version]);

  async function cancel(b: Booking) {
    if (!window.confirm(`Cancel ${b.pet_name}'s visit on ${formatLongDate(new Date(b.starts_at))}?`)) return;
    await supabase!.rpc("cancel_booking", { p_id: b.id });
    setVersion((v) => v + 1);
  }

  const now = Date.now();
  const nameOf = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="truncate text-sm text-muted">Signed in as {session.user.email}</p>
        <Button variant="ghost" onClick={() => supabase!.auth.signOut()}><LogOut className="size-4" /> Sign out</Button>
      </div>
      {bookings === null ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="card mt-4 p-6 text-center">
          <p className="text-muted">No bookings yet.</p>
          <ButtonLink to="/book" className="mt-4">Book a visit</ButtonLink>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {bookings.map((b) => {
            const start = new Date(b.starts_at);
            const active = (b.status === "pending" || b.status === "confirmed") && start.getTime() > now;
            return (
              <li key={b.id} className={`card flex flex-wrap items-center justify-between gap-4 p-5 ${active ? "" : "opacity-70"}`}>
                <div>
                  <p className="font-bold">{nameOf(b.service_slug)} for {b.pet_name}</p>
                  <p className="text-sm text-muted">{formatLongDate(start)} · {formatTime(start)} · Ref {b.reference}</p>
                  <p className={`mt-1 text-sm font-semibold ${b.status === "confirmed" ? "text-brand-dark" : "text-muted"}`}>{statusLabel[b.status]}</p>
                </div>
                {active && (
                  <Button variant="secondary" onClick={() => cancel(b)}><CalendarX className="size-4" /> Cancel</Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
