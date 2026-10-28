import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import { openingHours, services as staticServices, type OpeningHours, type Service } from "../data/clinic";
import type { ClinicDay } from "../lib/slots";
import { supabase } from "../lib/supabase";

export type Catalogue = {
  services: Service[];
  hours: OpeningHours;
  closures: ClinicDay[];
  capacity: number;
  leadMin: number;
};

const fallback: Catalogue = { services: staticServices, hours: openingHours, closures: [], capacity: 1, leadMin: 60 };

type ServiceRow = { slug: string; name: string; summary: string | null; description: string | null; duration_min: number; price_cents: number | null; bookable: boolean };
type HoursRow = { weekday: number; opens: string; closes: string };

const CatalogueContext = createContext<Catalogue>(fallback);

export const useCatalogue = () => useContext(CatalogueContext);

/**
 * Services, hours and booking rules, loaded once for the whole app. Uses the static data in data/clinic.ts
 * until Supabase is configured, then lets the database override it so staff
 * can change prices and hours without a deploy.
 */
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [catalogue, setCatalogue] = useState<Catalogue>(fallback);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [svc, hrs, cls, settings] = await Promise.all([
        supabase.from("services").select("*").eq("active", true).order("sort"),
        supabase.from("opening_hours").select("weekday, opens, closes").order("opens"),
        supabase.from("closures").select("day").gte("day", today),
        supabase.from("clinic_settings").select("capacity, lead_minutes").maybeSingle(),
      ]);
      if (cancelled || svc.error || hrs.error) return;

      const services = (svc.data as ServiceRow[]).map((row): Service => {
        const known = staticServices.find((s) => s.slug === row.slug);
        return {
          slug: row.slug,
          name: row.name,
          summary: row.summary ?? known?.summary ?? "",
          description: row.description ?? known?.description ?? "",
          durationMin: row.duration_min,
          priceCents: row.price_cents,
          bookable: row.bookable,
          icon: known?.icon ?? "stethoscope",
        };
      });

      const hours: OpeningHours = {};
      for (const { weekday, opens, closes } of hrs.data as HoursRow[]) {
        (hours[weekday] ??= []).push([opens.slice(0, 5), closes.slice(0, 5)]);
      }

      // An empty table means the seed hasn't been run yet; keep the built-in data.
      setCatalogue({
        services: services.some((s) => s.bookable) ? services : fallback.services,
        hours: Object.keys(hours).length ? hours : fallback.hours,
        closures: (cls.data ?? []).map((c: { day: string }) => c.day),
        capacity: settings.data?.capacity ?? fallback.capacity,
        leadMin: settings.data?.lead_minutes ?? fallback.leadMin,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return createElement(CatalogueContext.Provider, { value: catalogue }, children);
}
