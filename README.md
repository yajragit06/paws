# Paws & Claws Veterinary Care

Website and online booking for Paws & Claws Veterinary Care Sdn Bhd, Kiulap, Brunei.
See [PLAN.md](PLAN.md) for the full plan.

**Stack:** React 19 + TypeScript (Vite), Tailwind CSS v4, Supabase.

## Run locally

```bash
npm install
npm run dev
```

The site works without Supabase: services and hours come from `src/data/clinic.ts`, and the booking form sends the request on WhatsApp instead.

## Connect Supabase (online booking)

1. Create a Supabase project.
2. Apply `supabase/migrations/20261028000000_init.sql`, then `supabase/seed.sql` (SQL editor, or `supabase db push` with the CLI).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. In Supabase → Authentication → URL configuration, add your site URL so magic-link sign-in for **My bookings** redirects back.
5. To make someone staff: `update profiles set role = 'admin' where id = '<user id>';`

Once connected, the booking form writes to the `bookings` table through `book_appointment()`. That function re-checks opening hours, closures, lead time and capacity. An exclusion constraint prevents double bookings, even when two requests arrive at the same moment.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm test` | Unit tests (slot generation) |

## Where things live

- `src/data/clinic.ts`: contact details, hours, services (**confirm with the clinic**)
- `src/lib/slots.ts`: time-slot logic (Brunei time, UTC+8)
- `src/pages/Book.tsx`: booking flow
- `supabase/`: schema, row-level security, booking functions, seed data
