import { Mail, MapPin, Phone } from "lucide-react";
import { Facebook, Instagram } from "../ui/BrandIcons";
import { Link } from "react-router-dom";
import { clinic, mapsLink } from "../../data/clinic";
import { useCatalogue } from "../../hooks/useCatalogue";
import { formatWindows, weekdayNames } from "../../lib/hours";

export function Footer() {
  const { hours } = useCatalogue();
  // Show Monday first; most days share the same hours.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-extrabold">{clinic.legalName}</p>
          <p className="mt-2 text-sm text-muted">{clinic.tagline}</p>
          <div className="mt-4 flex gap-2">
            <a href={clinic.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-xl border border-line hover:border-brand hover:text-brand-dark">
              <Instagram className="size-5" />
            </a>
            <a href={clinic.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-10 place-items-center rounded-xl border border-line hover:border-brand hover:text-brand-dark">
              <Facebook className="size-5" />
            </a>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-bold">Visit</p>
          <a href={mapsLink} target="_blank" rel="noreferrer" className="mt-3 flex gap-2 text-muted hover:text-ink">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{clinic.address.join(", ")}</span>
          </a>
          <a href={clinic.phoneHref} className="mt-2 flex gap-2 text-muted hover:text-ink">
            <Phone className="mt-0.5 size-4 shrink-0" /> {clinic.phone}
          </a>
          <a href={`mailto:${clinic.email}`} className="mt-2 flex gap-2 break-all text-muted hover:text-ink">
            <Mail className="mt-0.5 size-4 shrink-0" /> {clinic.email}
          </a>
        </div>
        <div className="text-sm">
          <p className="font-bold">Opening hours</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
            {order.map((d) => (
              <div key={d} className="contents">
                <dt>{weekdayNames[d].slice(0, 3)}</dt>
                <dd>{formatWindows(hours[d] ?? [])}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="text-sm">
          <p className="font-bold">Explore</p>
          <ul className="mt-3 grid gap-2 text-muted">
            <li><Link to="/services" className="hover:text-ink">Services</Link></li>
            <li><Link to="/book" className="hover:text-ink">Book a visit</Link></li>
            <li><Link to="/my-bookings" className="hover:text-ink">My bookings</Link></li>
            <li><Link to="/about" className="hover:text-ink">About us</Link></li>
            <li><Link to="/contact" className="hover:text-ink">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-line py-6 pb-28 text-xs text-muted md:pb-6">
        © {new Date().getFullYear()} {clinic.legalName}. Kiulap, Brunei Darussalam.
      </div>
    </footer>
  );
}
