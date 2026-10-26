/** Homes you can book a viewing for (the same three as the hero listings). */
export const viewingHomes = [
  { id: "serenity", name: "Serenity Villas", area: "Palm Jumeirah", price: "AED 18.5M", photo: "photo-1691055657042-0c4f28d5f1bf" },
  { id: "barari", name: "Al Barari Residence", area: "Al Barari", price: "AED 24M", photo: "photo-1782720829237-ec146b0afe0a" },
  { id: "ranches", name: "Arabian Ranches Estate", area: "Arabian Ranches", price: "AED 9.8M", photo: "photo-1788022886933-fdce4bafb551" },
];

export type Language = "en" | "ar" | "ru" | "hi" | "ur" | "zh";

export const languages: { id: Language; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "ar", label: "Arabic", native: "العربية" },
  { id: "ru", label: "Russian", native: "Русский" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "ur", label: "Urdu", native: "اردو" },
  { id: "zh", label: "Mandarin", native: "中文" },
];

/** Fictional agents for the concept. */
export const agents: { name: string; role: string; speaks: Language[]; areas: string; photo: string }[] = [
  { name: "Omar Haddad", role: "Palm and Marina", speaks: ["ar", "en"], areas: "Palm Jumeirah, Dubai Marina, JBR", photo: "photo-1600878459138-e1123b37cb30" },
  { name: "Elena Morozova", role: "Downtown and the Creek", speaks: ["ru", "en"], areas: "Downtown, Business Bay, Creek Harbour", photo: "photo-1685760259914-ee8d2c92d2e0" },
  { name: "Priya Nair", role: "Family villas", speaks: ["hi", "en"], areas: "Dubai Hills, Arabian Ranches, Al Barari", photo: "photo-1609436132311-e4b0c9370469" },
  { name: "Sara Khan", role: "Off-plan launches", speaks: ["ur", "hi", "en"], areas: "New launches across Dubai", photo: "photo-1609371497456-3a55a205d5eb" },
  { name: "Daniel Wu", role: "Investors abroad", speaks: ["zh", "en"], areas: "Rental homes, Golden Visa buyers", photo: "photo-1543132220-4bf3de6e10ae" },
];

/** Who shows you round: someone who speaks your language, ideally the one who covers that area. */
export function agentFor(area: string, lang: Language) {
  const speakers = agents.filter((a) => a.speaks.includes(lang));
  return speakers.find((a) => a.areas.includes(area)) ?? speakers[0];
}

/** Cities overseas buyers often call from, with their IANA time zones. */
export const cities = [
  { name: "London", tz: "Europe/London" },
  { name: "Moscow", tz: "Europe/Moscow" },
  { name: "Riyadh", tz: "Asia/Riyadh" },
  { name: "Karachi", tz: "Asia/Karachi" },
  { name: "Mumbai", tz: "Asia/Kolkata" },
  { name: "Shanghai", tz: "Asia/Shanghai" },
  { name: "New York", tz: "America/New_York" },
];

/** Viewing slots, in Dubai time (24h). */
export const slots = [10, 11, 12, 14, 15, 16, 17, 18, 19];

export const office = {
  photo: "photo-1706074797611-a02f9ed06439",
  address: ["Level 12, Gate Avenue", "DIFC, Dubai"],
  hours: [
    ["Monday to Friday", "9:00 to 19:00"],
    ["Saturday", "10:00 to 16:00"],
    ["Sunday", "Viewings by appointment"],
  ],
  getting: [
    ["Metro", "Financial Centre station, 6 min walk"],
    ["Parking", "Valet at Gate Avenue, first 2 hours free"],
  ],
};

/** The next n days, starting tomorrow (Dubai has a Saturday–Sunday weekend). */
export function nextDays(n = 7) {
  const out: Date[] = [];
  const d = new Date();
  for (let i = 1; out.length < n; i++) out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
  return out;
}

/** A Dubai-time slot on a given day, as a real instant (Dubai is UTC+4 all year). */
export const dubaiInstant = (day: Date, hour: number) => new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour - 4));

export const timeIn = (when: Date, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(when);

export const hourIn = (when: Date, tz: string) =>
  +new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(when);
