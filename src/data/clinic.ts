// Clinic facts used across the site. Taken from public listings: confirm each
// value with the clinic before launch (see PLAN.md §2 and §10).

export const clinic = {
  name: "Paws & Claws",
  legalName: "Paws & Claws Veterinary Care Sdn Bhd",
  tagline: "From preventive to critical care, for every paw and claw.",
  phone: "+673 744 2000",
  phoneHref: "tel:+6737442000",
  // TODO: confirm this number is on WhatsApp.
  whatsappHref: "https://wa.me/6737442000",
  email: "admin@pawsclawsveterinary.com",
  address: ["No. 2, Spg 127-21, Kg Kiulap", "Bandar Seri Begawan, Brunei-Muara"],
  mapsQuery: "Paws & Claws Veterinary Care, Kiulap, Bandar Seri Begawan",
  instagram: "https://www.instagram.com/pawsnclaws.bn/",
  facebook: "https://www.facebook.com/pawsnclawsbn/",
  timeZone: "Asia/Brunei",
  utcOffset: "+08:00",
} as const;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapsQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery)}&output=embed`;

/** "HH:MM" open/close pairs per weekday, 0 = Sunday. */
export type OpeningHours = Record<number, [string, string][]>;

// Listed hours: 8:30 AM – 10 PM daily, with a Friday prayer break 12 – 2 PM.
export const openingHours: OpeningHours = {
  0: [["08:30", "22:00"]],
  1: [["08:30", "22:00"]],
  2: [["08:30", "22:00"]],
  3: [["08:30", "22:00"]],
  4: [["08:30", "22:00"]],
  5: [["08:30", "12:00"], ["14:00", "22:00"]],
  6: [["08:30", "22:00"]],
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  durationMin: number;
  /** Price in BND cents; null shows "Price on request". */
  priceCents: number | null;
  bookable: boolean;
  icon: "stethoscope" | "syringe" | "scissors" | "heart-pulse" | "smile" | "shopping-bag";
};

// TODO: durations and prices are placeholders until the clinic confirms them.
export const services: Service[] = [
  {
    slug: "consultation",
    name: "Consultation",
    summary: "A full check-up and a plan you understand.",
    description: "Nose-to-tail examination, a chat about diet and behaviour, and clear next steps with costs explained up front.",
    durationMin: 30,
    priceCents: null,
    bookable: true,
    icon: "stethoscope",
  },
  {
    slug: "vaccination",
    name: "Vaccination & prevention",
    summary: "Vaccines, deworming, flea and tick care.",
    description: "Core and lifestyle vaccines for puppies, kittens and adults, plus deworming and parasite prevention to keep them protected all year.",
    durationMin: 20,
    priceCents: null,
    bookable: true,
    icon: "syringe",
  },
  {
    slug: "surgery-consult",
    name: "Surgery & neutering",
    summary: "Planned procedures, done carefully.",
    description: "Neutering, spaying and other planned surgery. Book a pre-surgery consult and we'll walk you through preparation, anaesthesia and recovery.",
    durationMin: 30,
    priceCents: null,
    bookable: true,
    icon: "scissors",
  },
  {
    slug: "dental",
    name: "Dental check",
    summary: "Healthy teeth, fresher breath.",
    description: "Oral examination and advice on scaling, polishing and at-home dental care.",
    durationMin: 20,
    priceCents: null,
    bookable: true,
    icon: "smile",
  },
  {
    slug: "critical-care",
    name: "Critical care",
    summary: "Urgent help when it matters most.",
    description: "Hospitalisation, monitoring and treatment for seriously unwell pets. In an emergency, please call us right away rather than booking online.",
    durationMin: 30,
    priceCents: null,
    bookable: false,
    icon: "heart-pulse",
  },
  {
    slug: "pet-shop",
    name: "Supplements & accessories",
    summary: "Vet-recommended products in clinic.",
    description: "Supplements, prescription diets and everyday accessories, available at the counter during opening hours.",
    durationMin: 0,
    priceCents: null,
    bookable: false,
    icon: "shopping-bag",
  },
];

export const bookableServices = services.filter((s) => s.bookable);
