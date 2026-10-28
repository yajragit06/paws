import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Values pasted into a host's env settings often pick up quotes or spaces.
const clean = (v: unknown) => (typeof v === "string" ? v.trim().replace(/^["']|["']$/g, "") : "");

function connect(): SupabaseClient | null {
  let url = clean(import.meta.env.VITE_SUPABASE_URL);
  const anonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!url || !anonKey) return null;
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    // A bad URL must not take the whole site down; fall back to offline mode.
    console.error("Supabase is misconfigured, running without it:", err);
    return null;
  }
}

/** null until the project's Supabase keys are set (or if they are invalid). */
export const supabase: SupabaseClient | null = connect();
