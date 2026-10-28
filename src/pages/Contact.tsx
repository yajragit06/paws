import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { clinic, mapsEmbed, mapsLink } from "../data/clinic";
import { useCatalogue } from "../hooks/useCatalogue";
import { formatWindows, weekdayNames } from "../lib/hours";
import { clinicDayOf, weekdayOf } from "../lib/slots";
import { PageHeader } from "../components/ui/PageHeader";

export default function Contact() {
  const { hours } = useCatalogue();
  const today = weekdayOf(clinicDayOf(new Date()));
  const channels = [
    { icon: Phone, label: "Call", value: clinic.phone, href: clinic.phoneHref },
    { icon: MessageCircle, label: "WhatsApp", value: clinic.phone, href: clinic.whatsappHref },
    { icon: Mail, label: "Email", value: clinic.email, href: `mailto:${clinic.email}` },
    { icon: MapPin, label: "Address", value: clinic.address.join(", "), href: mapsLink },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="We're here to help">
        For emergencies, please call us straight away.
      </PageHeader>
      <div className="container-page grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-6">
          <ul className="card divide-y divide-line p-0">
            {channels.map(({ icon: Icon, label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex items-center gap-4 p-5 hover:bg-brand-tint"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-muted">{label}</span>
                    <span className="block font-semibold break-words">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="card p-6">
            <h2 className="font-bold">Opening hours</h2>
            <dl className="mt-4 grid gap-1 text-sm">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <div
                  key={d}
                  className={`flex justify-between gap-4 rounded-lg px-3 py-2 ${d === today ? "bg-brand-soft font-semibold text-brand-dark" : ""}`}
                >
                  <dt>{weekdayNames[d]}{d === today && " (today)"}</dt>
                  <dd className="text-right">{formatWindows(hours[d] ?? [])}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <iframe
          title="Map showing Paws & Claws in Kiulap"
          src={mapsEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="card min-h-[360px] w-full p-0 lg:h-full"
        />
      </div>
    </>
  );
}
