import { ArrowRight, Clock, HeartHandshake, MapPin, Moon, Phone, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { clinic, mapsEmbed, mapsLink } from "../data/clinic";
import { useCatalogue } from "../hooks/useCatalogue";
import { openStatus } from "../lib/hours";
import { ButtonLink } from "../components/ui/Button";
import { PetIllustration } from "../components/ui/PetIllustration";
import { ServiceIcon } from "../components/ui/ServiceIcon";

const reasons = [
  { icon: ShieldCheck, title: "Preventive to critical care", text: "Check-ups and vaccines through to surgery and hospital care, under one roof." },
  { icon: Moon, title: "Open late, every day", text: "We're open until 10 PM, seven days a week, so care fits around your day." },
  { icon: HeartHandshake, title: "Clear, honest advice", text: "We explain the options and the costs before any treatment begins." },
];

export default function Home() {
  const { services, hours } = useCatalogue();
  const status = openStatus(hours, new Date());

  return (
    <>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 pt-10 pb-12 sm:pt-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-dark">
            <span className={`size-2 rounded-full ${status.open ? "bg-emerald-500" : "bg-muted"}`} aria-hidden />
            {status.label}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Gentle care for every paw and claw.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted">
            A friendly veterinary clinic in Kiulap, Bandar Seri Begawan, looking after cats, dogs and small pets from
            first vaccines to critical care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/book" size="lg">
              Book a visit <ArrowRight className="size-5" />
            </ButtonLink>
            <ButtonLink to={clinic.phoneHref} variant="secondary" size="lg">
              <Phone className="size-5" /> {clinic.phone}
            </ButtonLink>
          </div>
        </div>
        <div className="card overflow-hidden p-0">
          <PetIllustration className="block h-auto w-full" />
        </div>
      </section>

      {/* Quick facts */}
      <section className="container-page" aria-label="Quick facts">
        <ul className="card grid divide-line p-0 sm:grid-cols-3 sm:divide-x">
          <li className="flex items-center gap-3 p-5">
            <Clock className="size-5 text-brand" aria-hidden />
            <span className="text-sm"><b className="block">Daily 8:30 AM – 10 PM</b><span className="text-muted">Fri break 12 – 2 PM</span></span>
          </li>
          <li className="flex items-center gap-3 border-t border-line p-5 sm:border-t-0">
            <MapPin className="size-5 text-brand" aria-hidden />
            <a href={mapsLink} target="_blank" rel="noreferrer" className="text-sm hover:text-brand-dark"><b className="block">Kiulap, BSB</b><span className="text-muted">Get directions</span></a>
          </li>
          <li className="flex items-center gap-3 border-t border-line p-5 sm:border-t-0">
            <Phone className="size-5 text-brand" aria-hidden />
            <a href={clinic.phoneHref} className="text-sm hover:text-brand-dark"><b className="block">{clinic.phone}</b><span className="text-muted">Emergencies: call first</span></a>
          </li>
        </ul>
      </section>

      {/* Services */}
      <section className="container-page mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-dark">What we do</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Our services</h2>
          </div>
          <Link to="/services" className="hidden text-sm font-semibold text-brand-dark hover:underline sm:block">All services →</Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                to={s.bookable ? `/book?service=${s.slug}` : "/services"}
                className="card group flex h-full items-start gap-4 p-5 transition-colors hover:border-brand"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                  <ServiceIcon icon={s.icon} className="size-6" />
                </span>
                <span>
                  <span className="block font-bold">{s.name}</span>
                  <span className="mt-1 block text-sm text-muted">{s.summary}</span>
                  <span className="mt-3 block text-sm font-semibold text-brand-dark">
                    {s.bookable ? "Book now →" : "Learn more →"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Why us */}
      <section className="container-page mt-20">
        <div className="rounded-[28px] bg-brand px-6 py-12 text-white sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Why pet owners choose us</h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="size-7" aria-hidden />
                <p className="mt-3 text-lg font-bold">{title}</p>
                <p className="mt-1 text-white/85">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Visit */}
      <section className="container-page mt-20 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-dark">Visit us</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Find the clinic</h2>
          <address className="mt-4 text-lg not-italic text-muted">
            {clinic.address.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to={mapsLink}>
              <MapPin className="size-4" /> Get directions
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary">Hours & contact</ButtonLink>
          </div>
        </div>
        <iframe
          title="Map showing Paws & Claws in Kiulap"
          src={mapsEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="card aspect-[4/3] w-full p-0"
        />
      </section>
    </>
  );
}
