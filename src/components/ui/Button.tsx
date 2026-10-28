import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-line bg-surface text-ink hover:border-brand hover:text-brand-dark",
  ghost: "text-ink hover:bg-brand-tint hover:text-brand-dark",
};
const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function buttonClass({ variant = "primary", size = "md", className = "" }: Omit<Common, "children">) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({ variant, size, className, ...props }: Common & ComponentProps<"button">) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, to, ...props }: Common & { to: string }) {
  const cls = buttonClass({ variant, size, className });
  if (/^(https?:|tel:|mailto:)/.test(to)) {
    const external = to.startsWith("http");
    return <a href={to} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...props} />;
  }
  return <Link to={to} className={cls} {...props} />;
}
