/**
 * Getting to work from each community. Times are worked out from the map, not
 * looked up: straight-line distance, stretched to a road route, at a typical
 * off-peak speed. Good enough to compare areas, not to plan a morning by.
 */
import type { Community } from "./communities";

export type Workplace = { id: string; name: string; short: string; at: [number, number] };

export const workplaces: Workplace[] = [
  { id: "difc", name: "DIFC", short: "DIFC", at: [55.2797, 25.2115] },
  { id: "bay", name: "Business Bay", short: "Business Bay", at: [55.265, 25.185] },
  { id: "media", name: "Media and Internet City", short: "Media City", at: [55.156, 25.0953] },
  { id: "dxb", name: "Dubai International Airport", short: "DXB airport", at: [55.3644, 25.2532] },
  { id: "south", name: "Dubai South and Al Maktoum Airport", short: "Dubai South", at: [55.1614, 24.896] },
];

/** Straight-line distance in km. */
export function km(a: [number, number], b: [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[1] - a[1]);
  const dLng = r(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[1])) * Math.cos(r(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Roads wind: a route is about a third longer than the straight line. */
const ROAD = 1.35;
/** Typical off-peak speed across Dubai, km/h, plus a few minutes to get going and park. */
const CAR_KMH = 55;
const CAR_EXTRA = 5;
/** Rush hour on Sheikh Zayed Road: roughly half as fast again. */
const RUSH = 1.6;
/** The metro runs straighter than the roads and averages about 42 km/h with stops, plus the walk at each end. */
const METRO_ROUTE = 1.15;
const METRO_KMH = 42;
const METRO_EXTRA = 12;

/** Communities with a metro or tram station inside them. */
const onMetro = new Set(["downtown", "marina"]);
/** Workplaces on the Red Line. Dubai South isn't. */
const metroWork = new Set(["difc", "bay", "media", "dxb"]);

export function byCar(c: Community, w: Workplace, rush = false) {
  const mins = (km(c.at, w.at) * ROAD * 60) / CAR_KMH + CAR_EXTRA;
  return Math.round(rush ? mins * RUSH : mins);
}

/** Minutes by metro, or null when one end has no station. */
export function byMetro(c: Community, w: Workplace) {
  if (!onMetro.has(c.id) || !metroWork.has(w.id)) return null;
  return Math.round((km(c.at, w.at) * METRO_ROUTE * 60) / METRO_KMH + METRO_EXTRA);
}

export const hasMetro = (c: Community) => onMetro.has(c.id);

/** "AED 2.5M" → 2_500_000 */
export const priceFromNumber = (c: Community) => parseFloat(c.priceFrom.replace(/[^\d.]/g, "")) * 1_000_000;

