import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ButtonLink } from "../ui/Button";
import { Logo } from "../ui/Logo";

const links = [
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/my-bookings", label: "My bookings" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "text-brand-dark" : "text-muted hover:text-ink"}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <ButtonLink to="/book" className="ml-2">
            Book a visit
          </ButtonLink>
        </nav>
        <button
          type="button"
          className="-mr-2 grid size-11 place-items-center rounded-xl md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="container-page grid gap-1 pb-4 md:hidden" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={(s) => `${linkClass(s)} py-3 text-base`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
