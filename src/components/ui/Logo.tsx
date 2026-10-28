import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Paws & Claws Veterinary Care, home">
      <img src="/images/logo.webp" alt="" width={40} height={40} className="size-10 rounded-xl" />
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight">Paws &amp; Claws</span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Veterinary Care</span>
      </span>
    </Link>
  );
}
