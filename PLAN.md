# Paws & Claws — Website Plan

A minimalist, easy-to-navigate site for **Paws & Claws Veterinary Care Sdn Bhd** (Kiulap, Bandar Seri Begawan, Brunei), with online booking added in a later phase.

- **Stack:** React + TypeScript (Vite), Tailwind CSS, Supabase (Postgres, Auth, Storage, Edge Functions)
- **Design reference:** the "Wag & Wash" booking screen (cream background, deep-teal primary, rounded cards, one clear call to action per screen)

---

## 1. Goals

1. A visitor can find **what the clinic offers, where it is, when it's open, and how to contact it** within 10 seconds on a phone.
2. A pet owner can **book an appointment in under a minute** (Phase 2).
3. Clinic staff can **manage services, opening hours and bookings** without touching code.

Non-goals for v1: online shop, telemedicine, a multi-branch setup.

---

## 2. Assets and content

The Google Business Profile and Instagram could not be fetched from this environment (blocked by the session's network policy). Before the content pass, collect these from the profile or from the clinic:

| Item | Source | Used on |
| --- | --- | --- |
| Logo (SVG/PNG) and brand colour, if any | Clinic | Header, favicon, OG image |
| Clinic photos (front, interior, team, pets) | GBP "Photos" tab | Home hero, About, gallery |
| Address and map pin | GBP | Footer, Contact, `LocalBusiness` schema |
| Phone / WhatsApp | GBP | Header CTA, Contact |
| Opening hours (including public holidays) | GBP | Footer, Contact, booking slot rules |
| Services list and prices | GBP "Services" + clinic | Services page, booking |
| Rating and review count, 3–6 short reviews (with permission) | GBP | Home "trust" strip |
| Vet names, photos and credentials | Clinic | About / Team |

**Known details (Brunei)**, from public listings. Please verify each with the clinic before launch:

| | |
| --- | --- |
| Name | Paws & Claws Veterinary Care Sdn Bhd |
| Address | No. 2, Spg 127-21, Kg Kiulap, Bandar Seri Begawan, Brunei-Muara |
| Phone | +673 744 2000 |
| Email | admin@pawsclawsveterinary.com |
| Hours (listed) | Most days 8:30 AM – 10 PM; Friday 8:30 AM – 12 PM and 2 – 10 PM |
| Services (listed) | Consultation, preventive care, surgery, critical care, supplements & accessories retail |
| Rating | about 4.7 from several hundred reviews |
| Social | Instagram [@pawsnclaws.bn](https://www.instagram.com/pawsnclaws.bn/), Facebook [pawsnclawsbn](https://www.facebook.com/pawsnclawsbn/) |

Brand voice from the Facebook page: *"comprehensive and exceptional care… from preventative to critical care."* Pull the logo, photos and current post styling from the Instagram account.

Store photos in Supabase Storage (`public-assets` bucket) or `/public/images` for static ones. Export them as WebP at 1x/2x sizes.

---

## 3. Design system (from the reference)

**Feel:** warm, calm, plenty of white space, one primary action per view, friendly illustration.

| Token | Value (starting point) | Use |
| --- | --- | --- |
| `--bg` | `#F7F3EC` cream | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--primary` | `#1F6B5C` deep teal | Buttons, selected states, links |
| `--primary-soft` | `#E3F0EC` | Illustration backdrops, chips |
| `--accent` | `#E8735A` coral | Small highlights, sparkles, rating star |
| `--ink` | `#1E2A27` | Headings |
| `--muted` | `#6B7470` | Body and secondary text |
| `--border` | `#E7E1D6` | Card and pill outlines |

- **Type:** one family, e.g. *Plus Jakarta Sans* (Google Fonts). Headings 700, body 400/500. Scale 14 / 16 / 20 / 28 / 40.
- **Shape:** card radius 16–20px, pill buttons and chips 12px, soft shadow (`0 1px 2px rgb(0 0 0 / .04), 0 8px 24px rgb(0 0 0 / .06)`).
- **Components seen in the reference:** price summary card, pet-name chip ("For Biscuit"), rating badge, day picker (selectable tiles), time-slot pills, full-width primary button, reassurance line with a check icon ("Free cancellation up to 24h before").
- **Dark mode:** optional later; define tokens as CSS variables in `tailwind.config.ts` so it costs little to add.
- **Accessibility:** contrast AA or better, visible focus rings in the primary colour, 44px minimum tap targets, and `aria-pressed` on selectable day and time tiles.

---

## 4. Information architecture

Keep the top nav to **four items + one CTA**, matching the reference header (`Book · Services · My bookings · avatar`).

```
/                Home
/services        Services & prices
/services/:slug  Service detail (optional, for SEO)
/about           Clinic, team, facilities
/contact         Map, hours, phone/WhatsApp, form
/book            Booking flow            (Phase 2)
/my-bookings     Owner's bookings        (Phase 2, auth)
/admin           Staff dashboard         (Phase 3, staff role)
```

**Header:** logo · Services · About · Contact · **[Book now]** (primary button). Collapses into a sheet menu on mobile, with "Book now" kept visible.
**Footer:** address, hours, phone, WhatsApp, map link, socials.
**Mobile:** a sticky bottom bar with **Call** and **Book**.

### Home page sections (top to bottom)
1. Hero: one line ("Gentle care for every paw and claw"), a short subline, **Book a visit** and **Call us**, and a clinic photo or illustration on a soft teal card.
2. Quick facts strip: rating ★ 4.x (N reviews) · open today until X · location.
3. Services: 4–6 cards (icon, name, "from B$__"), each linking to booking with that service preselected.
4. Why us: 3 short points (experienced vets, modern equipment, fear-free handling).
5. Reviews: 3 cards.
6. Visit us: map embed, hours table, directions button.

---

## 5. Phase 2: booking feature (mirrors the reference screen)

### Flow (single page, progressive)
1. **Service:** chosen from the list, or preselected via `?service=`.
2. **Pet:** pick a saved pet or add one (name, species, breed, age). Shown as the "For Biscuit" chip.
3. **Day:** horizontal scroll of the next 14 open days. Closed days are greyed out.
4. **Time:** the slots available for that service's duration, with an "N slots left" hint.
5. **Details:** owner name, phone and email. Magic-link sign-in is offered but not required.
6. **Confirm:** summary card (service, duration, price, deposit), then a **Book · B$__ deposit** button (or just **Confirm booking** if deposits are off).
7. **Done:** confirmation screen, an email/WhatsApp message, and "Add to calendar" (.ics).

The reassurance line under the button states the cancellation policy.

### Supabase data model

```sql
services      (id, slug, name, description, duration_min, price_cents, deposit_cents, active, sort)
staff         (id, name, role, photo_url, active)
opening_hours (id, weekday 0-6, opens time, closes time)          -- default weekly hours
closures      (id, date, reason)                                  -- public holidays, leave
pets          (id, owner_id → auth.users, name, species, breed, birth_date)
bookings      (id, owner_id, pet_id, service_id, staff_id null,
               starts_at timestamptz, ends_at timestamptz,
               status enum('pending','confirmed','cancelled','completed','no_show'),
               deposit_status enum('none','pending','paid','refunded'),
               notes, created_at)
profiles      (id → auth.users, full_name, phone, role enum('owner','staff','admin'))
```

- **No double booking:** an exclusion constraint on `bookings` (`tstzrange(starts_at, ends_at)` with `&&`, per `staff_id`, or clinic-wide if there is a single room), plus a `get_available_slots(service_id, date)` Postgres function that the UI calls.
- **Row-level security:** owners can read and write only their own `pets` and `bookings`; `staff`/`admin` can read and write everything; `services`, `opening_hours` and `closures` are publicly readable.
- **Guest booking:** an Edge Function `create-booking` validates the slot server-side, creates or links the profile, and inserts the booking.
- **Notifications:** an Edge Function triggered on booking insert or update sends email (Resend) and optionally WhatsApp, plus a reminder 24h before via `pg_cron`.

### Payments (decision needed)
The reference shows a deposit. Options for Brunei (currency BND):
- **Local bank gateway** (BIBD, Baiduri or another local acquirer): accepts local cards and bank transfers, but needs a merchant account and the bank's integration docs.
- **International gateway that accepts Brunei merchants** (check current country support; Stripe does not onboard Brunei businesses directly).
- **No deposit at launch**: confirm by WhatsApp. This is the fastest to ship and can be added later without schema changes.

Recommendation: launch without deposits and add a local gateway once no-shows are measured.

---

## 6. Phase 3: staff admin

- `/admin` behind the `staff`/`admin` role.
- Today's schedule (list + day timeline), with status changes in one tap.
- Create, edit and deactivate services; edit opening hours and closures.
- Search customers and pets; CSV export.

---

## 7. Project structure

```
src/
  app/            router, layout, providers (QueryClient, Supabase session)
  pages/          Home, Services, About, Contact, Book, MyBookings, admin/*
  components/
    ui/           Button, Card, Chip, Badge, Sheet, Input, Skeleton
    booking/      ServicePicker, PetChip, DayPicker, TimeSlots, SummaryCard
    layout/       Header, Footer, MobileActionBar
  lib/            supabase.ts, format.ts (B$/BND, dates in Asia/Brunei), seo.ts
  hooks/          useServices, useSlots, useBookings
  types/          database.ts (generated by `supabase gen types typescript`)
supabase/
  migrations/     schema, RLS, functions
  functions/      create-booking, notify, (payments-webhook)
  seed.sql
```

**Libraries:** React Router, TanStack Query, React Hook Form + Zod, date-fns / date-fns-tz, lucide-react icons, and optionally Radix primitives for the sheet and dialog. No heavy UI kit, to keep the minimalist look and a small bundle.

---

## 8. Milestones

| # | Milestone | Output |
| --- | --- | --- |
| 0 | **Assets & content** | Logo, photos, services/prices, hours, reviews collected; payment decision made |
| 1 | **Scaffold** | Vite + React + TS + Tailwind, design tokens, UI primitives, layout, routing, Supabase project + generated types |
| 2 | **Marketing site** | Home, Services, About, Contact, with services and hours read from Supabase; SEO (meta, OG, `VeterinaryCare` JSON-LD, sitemap); mobile action bar |
| 3 | **Booking MVP** | Schema + RLS + slot function, `/book` flow, guest booking, confirmation email, `/my-bookings` with cancel |
| 4 | **Admin** | Staff dashboard, hours/closures editor, service editor |
| 5 | **Polish & launch** | Lighthouse ≥ 95 on mobile, accessibility pass, analytics (Plausible/GA4), deploy (Vercel/Netlify) + custom domain, link the site from the Google Business Profile |
| 6 | **Optional** | Deposits (local gateway), WhatsApp reminders, Bahasa Melayu / 中文 translations |

---

## 9. Quality checklist

- Works at 360px width with no horizontal scroll; the primary CTA is always reachable.
- All times stored as UTC and displayed in `Asia/Brunei` (UTC+8).
- Slot availability is re-checked server-side at submit time, with a friendly "that slot was just taken" message.
- Loading skeletons instead of spinners; empty and error states for every list.
- Unit tests for slot generation; one Playwright end-to-end test of the booking flow.
- `.env` holds only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the service-role key is used only inside Edge Functions.

---

## 10. Open questions for the clinic

1. Are bookings per vet, or clinic-wide slots? How many appointments can run at once?
2. Final services list, durations and prices (consultation, vaccination, grooming, dental, surgery consult, boarding?)
3. Deposit at launch: yes or no? What is the cancellation policy?
4. Do you want WhatsApp as the main contact channel?
5. Which languages: English only, or also Bahasa Melayu / Chinese?
6. Domain name and who owns it?
