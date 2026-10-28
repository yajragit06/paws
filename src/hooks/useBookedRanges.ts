import { useEffect, useState } from "react";
import type { ClinicDay, Range } from "../lib/slots";
import { supabase } from "../lib/supabase";

/** Busy times on `day` (no personal details), refreshed when `version` changes. */
export function useBookedRanges(day: ClinicDay | null, version = 0): { ranges: Range[]; loading: boolean } {
  const [state, setState] = useState<{ day: ClinicDay | null; ranges: Range[] }>({ day: null, ranges: [] });

  useEffect(() => {
    if (!supabase || !day) return;
    let cancelled = false;
    supabase.rpc("get_booked_ranges", { p_day: day }).then(({ data, error }) => {
      if (cancelled) return;
      const rows = error ? [] : (data as { starts_at: string; ends_at: string }[]);
      setState({ day, ranges: rows.map((r) => ({ start: new Date(r.starts_at), end: new Date(r.ends_at) })) });
    });
    return () => {
      cancelled = true;
    };
  }, [day, version]);

  const loading = !!supabase && !!day && state.day !== day;
  return { ranges: state.day === day ? state.ranges : [], loading };
}
