/**
 * Dubai purchase costs, as commonly quoted for 2026. Approximate: buyers
 * should confirm with the Dubai Land Department (DLD) before paying.
 */
export const VAT = 0.05;
export const GOLDEN_VISA_FROM = 2_000_000;

export const aed = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
export const aedShort = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `AED ${Math.round(n / 1000)}K`;

export const dldFee = (price: number) => price * 0.04 + 580;

/** Expats can borrow up to 80% on a first home up to AED 5M, 70% above. */
export const maxLoanShare = (price: number) => (price <= 5_000_000 ? 0.8 : 0.7);

export type CostLine = { label: string; note: string; amount: number };

export function purchaseCosts(price: number, loan = 0): CostLine[] {
  const lines: CostLine[] = [
    { label: "DLD transfer fee", note: "4% of the price, paid to the Land Department", amount: dldFee(price) },
    {
      label: "Trustee office fee",
      note: "Registers the sale on the day of transfer",
      amount: (price >= 500_000 ? 4000 : 2000) * (1 + VAT),
    },
    { label: "Agency commission", note: "2% of the price, plus VAT", amount: price * 0.02 * (1 + VAT) },
  ];
  if (loan > 0) {
    lines.push({ label: "Mortgage registration", note: "0.25% of the loan, plus AED 290", amount: loan * 0.0025 + 290 });
    lines.push({ label: "Bank valuation", note: "One-off, set by the bank", amount: 3000 * (1 + VAT) });
  }
  return lines;
}

export const presets = [
  { label: "Marina apartment", price: 1_800_000 },
  { label: "Downtown 2-bed", price: 3_200_000 },
  { label: "Hills villa", price: 7_500_000 },
  { label: "Palm villa", price: 18_500_000 },
];

/** The buyer's chosen home, so each step can quote their own amounts. */
export type Deal = { price: number; loan: number };

export const steps: {
  title: string;
  time: string;
  pay: (d: Deal) => string;
  bring: string;
  body: (d: Deal) => string;
  photo: string;
}[] = [
  {
    title: "View and choose",
    time: "Week 1",
    pay: () => "Nothing yet",
    bring: "Passport copy",
    body: () => "Walk round the homes you like, in person or on a video call with your agent.",
    photo: "photo-1691055657042-0c4f28d5f1bf",
  },
  {
    title: "Agree and sign Form F",
    time: "Week 1 to 2",
    pay: ({ price }) => `${aed(price * 0.1)} deposit cheque (10%), held by the agency`,
    bring: "Passport, Emirates ID if you have one",
    body: () => "Form F is the sale agreement from the Land Department. It fixes the price and the transfer date.",
    photo: "photo-1788022886933-fdce4bafb551",
  },
  {
    title: "Developer NOC",
    time: "Week 2 to 3",
    pay: () => "AED 500 to 5,000 to the developer",
    bring: "Nothing new",
    body: () => "The developer confirms there are no service charges owing and gives a No Objection Certificate.",
    photo: "photo-1634007626524-f47fa37810a7",
  },
  {
    title: "Transfer at the trustee office",
    time: "Week 3 to 4",
    pay: ({ price, loan }) =>
      loan > 0
        ? `${aed(price * 0.9 - loan)} from you, ${aed(loan)} from your bank, plus the ${aed(dldFee(price))} DLD fee`
        : `The balance of ${aed(price * 0.9)} and the ${aed(dldFee(price))} DLD fee, by manager's cheque`,
    bring: "Original passport",
    body: () => "Buyer and seller (or their agents) meet at a trustee office. The title deed is issued the same day.",
    photo: "photo-1722502831677-74729ac2eb78",
  },
  {
    title: "Keys and Golden Visa",
    time: "Week 4 onwards",
    pay: () => "DEWA deposit for power and water: AED 2,000 for an apartment, 4,000 for a villa",
    bring: "Title deed",
    body: ({ price }) =>
      price >= GOLDEN_VISA_FROM
        ? "Collect the keys. Your home is worth AED 2M or more, so you can apply for a 10-year Golden Visa."
        : "Collect the keys. Homes worth AED 2M or more also qualify the owner for a 10-year Golden Visa.",
    photo: "photo-1782720829237-ec146b0afe0a",
  },
];
