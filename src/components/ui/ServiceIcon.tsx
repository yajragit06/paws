import { HeartPulse, Scissors, ShoppingBag, Smile, Stethoscope, Syringe, type LucideProps } from "lucide-react";
import type { Service } from "../../data/clinic";

const icons = {
  stethoscope: Stethoscope,
  syringe: Syringe,
  scissors: Scissors,
  "heart-pulse": HeartPulse,
  smile: Smile,
  "shopping-bag": ShoppingBag,
} satisfies Record<Service["icon"], unknown>;

export function ServiceIcon({ icon, ...props }: { icon: Service["icon"] } & LucideProps) {
  const Icon = icons[icon];
  return <Icon aria-hidden {...props} />;
}
