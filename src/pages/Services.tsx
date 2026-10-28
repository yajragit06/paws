import { Clock, Phone } from "lucide-react";
import { clinic } from "../data/clinic";
import { useCatalogue } from "../hooks/useCatalogue";
import { formatDuration, formatPrice } from "../lib/format";
import { ButtonLink } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { ServiceIcon } from "../components/ui/ServiceIcon";

export default function Services() {
  const { services } = useCatalogue();
  return (
    <>
      <PageHeader eyebrow="Services" title="Care for every stage of life">
        From a puppy's first vaccines to round-the-clock hospital care. Not sure what you need? Book a consultation and
        we'll guide you.
      </PageHeader>
      <ul className="container-page grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <li key={s.slug} id={s.slug} className="card flex flex-col p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                <ServiceIcon icon={s.icon} className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">{s.name}</h2>
                <p className="mt-1 text-muted">{s.description}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="flex items-center gap-3 text-sm text-muted">
                {s.bookable && (
                  <span className="inline-flex items-center gap-1"><Clock className="size-4" /> {formatDuration(s.durationMin)}</span>
                )}
                <span className="font-semibold text-ink">{formatPrice(s.priceCents)}</span>
              </p>
              {s.bookable ? (
                <ButtonLink to={`/book?service=${s.slug}`}>Book</ButtonLink>
              ) : (
                <ButtonLink to={clinic.phoneHref} variant="secondary"><Phone className="size-4" /> Call us</ButtonLink>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
