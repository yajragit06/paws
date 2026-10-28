import { CalendarDays, Phone } from "lucide-react";
import { clinic } from "../../data/clinic";
import { ButtonLink } from "../ui/Button";

/** Call and Book always within thumb reach on phones. */
export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <ButtonLink to={clinic.phoneHref} variant="secondary">
          <Phone className="size-4" /> Call
        </ButtonLink>
        <ButtonLink to="/book">
          <CalendarDays className="size-4" /> Book a visit
        </ButtonLink>
      </div>
    </div>
  );
}
