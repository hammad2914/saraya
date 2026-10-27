/**
 * Buying from abroad: residency through property, mortgages for people who
 * don't live in the UAE, and signing without flying in. These are the
 * long-standing rules as commonly quoted for 2026; they change, so buyers
 * should confirm with the Land Department, ICP and their bank before paying.
 */
import { GOLDEN_VISA_FROM } from "./buying";

export const INVESTOR_VISA_FROM = 750_000;

export type Residency = { id: "none" | "investor" | "golden"; from: number; title: string; years: string; family: string; note: string };

export const residency: Residency[] = [
  { id: "none", from: 0, title: "No residency", years: "Visit as a tourist", family: "", note: "You can still own, let and sell the home freely." },
  {
    id: "investor",
    from: INVESTOR_VISA_FROM,
    title: "Property investor visa",
    years: "2 years, renewable",
    family: "Your spouse and children can join you",
    note: "Renew it for as long as you own the home.",
  },
  {
    id: "golden",
    from: GOLDEN_VISA_FROM,
    title: "Golden Visa",
    years: "10 years, renewable",
    family: "Your spouse and children are included",
    note: "No need to live in Dubai to keep it. Off-plan and mortgaged homes can count.",
  },
];

export const residencyFor = (price: number) => [...residency].reverse().find((r) => price >= r.from)!;

/** Banks lend people living abroad less than residents: about half the price is typical. */
export const NON_RESIDENT_LOAN = 0.5;

/** How someone abroad buys without flying in. */
export const remoteSteps = [
  { title: "Video viewing", body: "Your agent walks the home on a call, at a time that suits your clock.", where: "From home" },
  { title: "Reserve it", body: "Sign the sale agreement (Form F) by e-signature and send the 10% deposit by bank transfer.", where: "From home" },
  { title: "Power of attorney", body: "Sign it at a notary near you; it is then attested by the UAE embassy. Someone you trust in Dubai can then sign for you.", where: "A notary near you" },
  { title: "Transfer day", body: "Your attorney signs at the trustee office and the title deed is issued in your name. Watch it on a call.", where: "Dubai, without you" },
  { title: "Keys and visa", body: "Keys are held or couriered. Apply for residency on your first visit.", where: "Your first trip" },
];
