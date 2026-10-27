/**
 * For owners: what a home might sell or rent for, worked out from the homes
 * listed on this site (asking prices per sq ft in the same community), plus the
 * costs of selling or letting as commonly quoted in Dubai for 2026. Estimates
 * only; a valuation visit sets the real price.
 */
import { communities } from "./communities";
import { type Home, homes, type Kind } from "./homes";
import { VAT } from "./buying";

export type Owned = { community: string; kind: Kind; beds: number; sqft: number };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const flat = (k: Kind) => k === "Apartment" || k === "Penthouse";

/** Homes like this one: same community, and flats compared with flats, houses with houses. */
export function comparables(o: Owned, deal: "buy" | "rent" = "buy"): Home[] {
  const here = homes.filter((h) => h.community === o.community && h.deal === deal);
  const alike = here.filter((h) => flat(h.kind) === flat(o.kind));
  return (alike.length >= 2 ? alike : here).sort((a, b) => Math.abs(a.sqft - o.sqft) - Math.abs(b.sqft - o.sqft)).slice(0, 4);
}

/** Yearly service charge per sq ft, typical for 2026. Villas pay far less than towers. */
const serviceRate: Record<string, [flat: number, house: number]> = {
  palm: [24, 8],
  downtown: [22, 6],
  marina: [18, 6],
  hills: [16, 5],
  creek: [17, 5],
  ranches: [15, 4],
};

export function estimate(o: Owned) {
  const comps = comparables(o);
  const ppsf = median(comps.map((h) => h.price / h.sqft));
  // Rounded: an estimate quoted to the dirham would look more exact than it is.
  const mid = Math.round((ppsf * o.sqft) / 10_000) * 10_000;
  // Rent: from rent listings here if there are any, else the area's usual yield.
  const rents = comparables(o, "rent");
  const c = communities.find((x) => x.id === o.community)!;
  const yieldPct = parseFloat(c.yield.replace(/[^\d.]/g, "")) / 100;
  const rent = Math.round((rents.length ? median(rents.map((h) => h.price / h.sqft)) * o.sqft : mid * yieldPct) / 1000) * 1000;
  return { comps, ppsf, low: mid * 0.92, mid, high: mid * 1.08, rent, rentComps: rents };
}

/** Selling: the agency's 2% plus VAT, and the developer's no-objection certificate. */
export function sellingCosts(price: number) {
  return [
    { label: "Agency commission", note: "2% of the price, plus VAT", amount: price * 0.02 * (1 + VAT) },
    { label: "Developer NOC", note: "Confirms no service charges are owed", amount: 3000 * (1 + VAT) },
  ];
}

/** Letting: service charges, and 5% of the rent for someone to manage it. */
export function lettingCosts(o: Owned, rent: number) {
  const rate = serviceRate[o.community][flat(o.kind) ? 0 : 1];
  return [
    { label: "Service charges", note: `About AED ${rate} per sq ft a year`, amount: rate * o.sqft },
    { label: "Management", note: "5% of the rent, plus VAT", amount: rent * 0.05 * (1 + VAT) },
  ];
}

export const sizes: Record<Kind, [number, number]> = {
  Apartment: [600, 3000],
  Penthouse: [2500, 8000],
  Townhouse: [1800, 4000],
  Villa: [3000, 12000],
};
