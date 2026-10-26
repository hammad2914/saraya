/** Homes on the market (fictional listings for the concept, with real Unsplash photos). */
export type Deal = "buy" | "rent" | "offplan";

export type Home = {
  id: string;
  name: string;
  kind: "Villa" | "Apartment" | "Penthouse" | "Townhouse";
  area: string;
  /** The community on the map this home belongs to. */
  community: string;
  deal: Deal;
  /** AED: the price, or the yearly rent. */
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  /** One line on what makes it worth seeing. */
  hook: string;
  /** Off-plan only: when the keys are handed over. */
  handover?: string;
  photos: { id: string; room: string }[];
};

export const homes: Home[] = [
  {
    id: "burj-view",
    name: "Burj View Residence",
    kind: "Apartment",
    area: "Downtown",
    community: "downtown",
    deal: "buy",
    price: 6_900_000,
    beds: 3,
    baths: 4,
    sqft: 2_350,
    hook: "Floor 41, the Burj Khalifa fills the living-room window",
    photos: [
      { id: "photo-1721804222945-e443900b382a", room: "The view" },
      { id: "photo-1758448511322-8bfc73daf606", room: "Living room" },
      { id: "photo-1765862835260-47843a7bba45", room: "Main bedroom" },
    ],
  },
  {
    id: "frond-villa",
    name: "Frond Beach Villa",
    kind: "Villa",
    area: "Palm Jumeirah",
    community: "palm",
    deal: "buy",
    price: 32_000_000,
    beds: 6,
    baths: 7,
    sqft: 7_800,
    hook: "Private beach, pool and a jetty on the frond",
    photos: [
      { id: "photo-1602343168117-bb8ffe3e2e9f", room: "Pool and garden" },
      { id: "photo-1758565811176-ccd94357a844", room: "Living room" },
      { id: "photo-1785535573585-8f962fa3cda5", room: "Kitchen" },
    ],
  },
  {
    id: "hills-villa",
    name: "Hills Park Villa",
    kind: "Villa",
    area: "Dubai Hills",
    community: "hills",
    deal: "buy",
    price: 11_200_000,
    beds: 5,
    baths: 6,
    sqft: 5_600,
    hook: "Backs onto the park, five minutes to the school",
    photos: [
      { id: "photo-1613977257363-707ba9348227", room: "Front" },
      { id: "photo-1613977257592-4871e5fcd7c4", room: "Pool" },
      { id: "photo-1613977257365-aaae5a9817ff", room: "Terrace" },
      { id: "photo-1683629357963-adf2b1fa9ad9", room: "Kitchen" },
    ],
  },
  {
    id: "marina-penthouse",
    name: "Marina Waterfront Penthouse",
    kind: "Penthouse",
    area: "Dubai Marina",
    community: "marina",
    deal: "buy",
    price: 12_500_000,
    beds: 4,
    baths: 5,
    sqft: 4_100,
    hook: "Wraparound terrace over the yachts and the Palm",
    photos: [
      { id: "photo-1722502831572-2d12e8f30c59", room: "The view" },
      { id: "photo-1654520015092-b9b4ddf2e7c7", room: "Living room" },
      { id: "photo-1578683010236-d716f9a3f461", room: "Main bedroom" },
    ],
  },
  {
    id: "ranches-villa",
    name: "Ranches Garden Villa",
    kind: "Villa",
    area: "Arabian Ranches",
    community: "ranches",
    deal: "buy",
    price: 7_400_000,
    beds: 4,
    baths: 5,
    sqft: 4_300,
    hook: "Big garden, quiet street, golf club at the end of it",
    photos: [
      { id: "photo-1670589953882-b94c9cb380f5", room: "Pool and house" },
      { id: "photo-1682184805271-11671b7ecf4c", room: "Living room" },
      { id: "photo-1765862835319-18fb6f8caff6", room: "Bedroom" },
    ],
  },
  {
    id: "creek-tower",
    name: "Creek Edge, Tower B",
    kind: "Apartment",
    area: "Creek Harbour",
    community: "creek",
    deal: "offplan",
    price: 2_400_000,
    beds: 2,
    baths: 2,
    sqft: 1_250,
    handover: "Q4 2027",
    hook: "Skyline and Creek views, pay 60% before the keys",
    photos: [
      { id: "photo-1636801686436-bcb8eae09a41", room: "The view" },
      { id: "photo-1757524503555-b62633f47670", room: "Living room (show flat)" },
    ],
  },
  {
    id: "sky-pool",
    name: "One Sky Residences",
    kind: "Apartment",
    area: "Business Bay",
    community: "downtown",
    deal: "offplan",
    price: 3_800_000,
    beds: 3,
    baths: 3,
    sqft: 1_900,
    handover: "Q2 2028",
    hook: "Rooftop infinity pool, ten minutes to DIFC",
    photos: [
      { id: "photo-1695461059878-9b07de810ddd", room: "Rooftop pool" },
      { id: "photo-1686023858216-4f54c853acf2", room: "Kitchen (show flat)" },
    ],
  },
  {
    id: "jbr-rent",
    name: "Beachfront Apartment, JBR",
    kind: "Apartment",
    area: "Dubai Marina",
    community: "marina",
    deal: "rent",
    price: 320_000,
    beds: 2,
    baths: 3,
    sqft: 1_600,
    hook: "Walk out to the beach, furnished, free in December",
    photos: [
      { id: "photo-1737724035436-1a301aca2aa2", room: "The view" },
      { id: "photo-1613545325278-f24b0cae1224", room: "Living room" },
    ],
  },
  {
    id: "villa-rent",
    name: "Garden Villa for Rent",
    kind: "Villa",
    area: "Dubai Hills",
    community: "hills",
    deal: "rent",
    price: 650_000,
    beds: 5,
    baths: 6,
    sqft: 5_200,
    hook: "Pool, maid's room, one year or longer",
    photos: [
      { id: "photo-1580587771525-78b9dba3b914", room: "Pool and house" },
      { id: "photo-1785535573676-5dafa00b3c8b", room: "Kitchen" },
    ],
  },
];

export const dealLabels: Record<Deal, string> = { buy: "Buy", rent: "Rent", offplan: "Off-plan" };

/** "AED 6.9M", "AED 320K a year". */
export function priceLabel(h: Pick<Home, "price" | "deal">) {
  const n = h.price >= 1_000_000 ? `${+(h.price / 1_000_000).toFixed(1)}M` : `${Math.round(h.price / 1000)}K`;
  return `AED ${n}${h.deal === "rent" ? " a year" : ""}`;
}
