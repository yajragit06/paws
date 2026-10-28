-- Paws & Claws: services, opening hours and bookings.
-- Times are stored as timestamptz (UTC) and interpreted in Asia/Brunei.

create extension if not exists btree_gist;

create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- ---------------------------------------------------------------- catalogue

create table public.services (
  slug          text primary key,
  name          text not null,
  summary       text,
  description   text,
  duration_min  int  not null check (duration_min > 0),
  price_cents   int  check (price_cents >= 0),
  bookable      boolean not null default true,
  active        boolean not null default true,
  sort          int  not null default 0
);

create table public.opening_hours (
  id       bigint generated always as identity primary key,
  weekday  smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  opens    time not null,
  closes   time not null,
  check (opens < closes)
);

create table public.closures (
  day     date primary key,
  reason  text
);

-- Single-row settings table.
create table public.clinic_settings (
  id            boolean primary key default true check (id),
  capacity      int not null default 1 check (capacity between 1 and 20), -- appointments at once
  lead_minutes  int not null default 60 check (lead_minutes >= 0)
);

-- ---------------------------------------------------------------- people

create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  phone      text,
  role       text not null default 'owner' check (role in ('owner', 'staff', 'admin'))
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin'));
$$;

-- ---------------------------------------------------------------- bookings

create table public.bookings (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  service_slug  text not null references public.services (slug),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  -- Which of the clinic's parallel appointment "lanes" this booking uses (1..capacity).
  lane          smallint not null default 1,
  status        public.booking_status not null default 'pending',
  owner_id      uuid references auth.users on delete set null,
  owner_name    text not null check (length(owner_name) between 1 and 120),
  owner_phone   text not null check (length(owner_phone) between 5 and 30),
  owner_email   text not null check (owner_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  pet_name      text not null check (length(pet_name) between 1 and 60),
  pet_species   text not null check (length(pet_species) between 1 and 30),
  notes         text check (length(notes) <= 1000),
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at),
  -- No two active bookings may overlap in the same lane.
  constraint bookings_no_overlap exclude using gist (
    lane with =, tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'confirmed'))
);

create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_owner_email_idx on public.bookings (lower(owner_email));

-- ---------------------------------------------------------------- RLS

alter table public.services        enable row level security;
alter table public.opening_hours   enable row level security;
alter table public.closures        enable row level security;
alter table public.clinic_settings enable row level security;
alter table public.profiles        enable row level security;
alter table public.bookings        enable row level security;

create policy "public read" on public.services        for select using (true);
create policy "public read" on public.opening_hours   for select using (true);
create policy "public read" on public.closures        for select using (true);
create policy "public read" on public.clinic_settings for select using (true);

create policy "staff write" on public.services        for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.opening_hours   for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.closures        for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.clinic_settings for all using (public.is_staff()) with check (public.is_staff());

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "edit own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "staff manage profiles" on public.profiles for update using (public.is_staff());

-- Owners see bookings they made while signed in, or made as a guest with the
-- same email they later sign in with. Inserts go through book_appointment().
create policy "own bookings" on public.bookings for select using (
  owner_id = auth.uid()
  or lower(owner_email) = lower(auth.jwt() ->> 'email')
  or public.is_staff()
);
create policy "staff manage bookings" on public.bookings for update using (public.is_staff());

-- ---------------------------------------------------------------- RPCs

-- Busy time ranges on a clinic day, without any personal details, so the
-- booking page can grey out full slots.
create function public.get_booked_ranges(p_day date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select b.starts_at, b.ends_at
  from public.bookings b
  where b.status in ('pending', 'confirmed')
    and b.starts_at < ((p_day + 1)::timestamp at time zone 'Asia/Brunei')
    and b.ends_at   > (p_day::timestamp at time zone 'Asia/Brunei');
$$;

create function public.book_appointment(
  p_service_slug text,
  p_starts_at    timestamptz,
  p_owner_name   text,
  p_owner_phone  text,
  p_owner_email  text,
  p_pet_name     text,
  p_pet_species  text,
  p_notes        text default null
)
returns table (id uuid, reference text, starts_at timestamptz, ends_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_service  public.services;
  v_settings public.clinic_settings;
  v_local    timestamp := p_starts_at at time zone 'Asia/Brunei';
  v_ends_at  timestamptz;
  v_lane     int;
begin
  select * into v_service from public.services s where s.slug = p_service_slug and s.active and s.bookable;
  if not found then raise exception 'service_unavailable' using errcode = 'P0001'; end if;

  select * into v_settings from public.clinic_settings limit 1;
  if not found then v_settings := row(true, 1, 60)::public.clinic_settings; end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_min);

  if p_starts_at < now() + make_interval(mins => v_settings.lead_minutes) then
    raise exception 'too_soon' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.closures c where c.day = v_local::date) then
    raise exception 'clinic_closed' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.opening_hours h
    where h.weekday = extract(dow from v_local)
      and h.opens <= v_local::time
      and (v_local + make_interval(mins => v_service.duration_min))::time <= h.closes
      and (v_local + make_interval(mins => v_service.duration_min))::date = v_local::date
  ) then
    raise exception 'outside_hours' using errcode = 'P0001';
  end if;

  -- Take the first free lane; the exclusion constraint makes this race-safe.
  for v_lane in 1 .. v_settings.capacity loop
    begin
      return query
        insert into public.bookings as b
          (service_slug, starts_at, ends_at, lane, owner_id, owner_name, owner_phone, owner_email, pet_name, pet_species, notes)
        values
          (p_service_slug, p_starts_at, v_ends_at, v_lane, auth.uid(), trim(p_owner_name), trim(p_owner_phone),
           lower(trim(p_owner_email)), trim(p_pet_name), trim(p_pet_species), nullif(trim(p_notes), ''))
        returning b.id, b.reference, b.starts_at, b.ends_at;
      return;
    exception when exclusion_violation then
      -- lane busy, try the next one
    end;
  end loop;

  raise exception 'slot_taken' using errcode = 'P0001';
end $$;

create function public.cancel_booking(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.bookings b set status = 'cancelled'
  where b.id = p_id
    and b.status in ('pending', 'confirmed')
    and b.starts_at > now()
    and (b.owner_id = auth.uid() or lower(b.owner_email) = lower(auth.jwt() ->> 'email') or public.is_staff());
  return found;
end $$;

revoke all on function public.get_booked_ranges(date) from public;
revoke all on function public.book_appointment(text, timestamptz, text, text, text, text, text, text) from public;
revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.get_booked_ranges(date) to anon, authenticated;
grant execute on function public.book_appointment(text, timestamptz, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
