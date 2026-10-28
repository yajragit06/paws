-- Starting data. Durations and prices are placeholders until the clinic confirms them.

insert into public.clinic_settings (capacity, lead_minutes) values (2, 60);

insert into public.services (slug, name, summary, duration_min, price_cents, bookable, sort) values
  ('consultation',    'Consultation',              'A full check-up and a plan you understand.', 30, null, true,  1),
  ('vaccination',     'Vaccination & prevention',  'Vaccines, deworming, flea and tick care.',   20, null, true,  2),
  ('surgery-consult', 'Surgery & neutering',       'Planned procedures, done carefully.',        30, null, true,  3),
  ('dental',          'Dental check',              'Healthy teeth, fresher breath.',             20, null, true,  4),
  ('critical-care',   'Critical care',             'Urgent help when it matters most.',          30, null, false, 5),
  ('pet-shop',        'Supplements & accessories', 'Vet-recommended products in clinic.',        1,  null, false, 6);

-- 8:30 AM – 10 PM daily; Friday closes 12 – 2 PM for prayers.
insert into public.opening_hours (weekday, opens, closes) values
  (0, '08:30', '22:00'), (1, '08:30', '22:00'), (2, '08:30', '22:00'), (3, '08:30', '22:00'),
  (4, '08:30', '22:00'), (5, '08:30', '12:00'), (5, '14:00', '22:00'), (6, '08:30', '22:00');
