import { clinic } from "../data/clinic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`);

/** Downloads an .ics file so the owner can add the visit to their calendar. */
export function downloadIcs({ uid, title, start, end, description }: { uid: string; title: string; start: Date; end: Date; description: string }) {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Paws & Claws//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@pawsclaws`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(`${clinic.legalName}, ${clinic.address.join(", ")}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "paws-claws-visit.ics" });
  a.click();
  URL.revokeObjectURL(url);
}
