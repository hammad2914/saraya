export const photo = (id: string, w = 2400) => `https://images.unsplash.com/${id}?w=${w}&q=82&fm=jpg`;

export type Community = {
  id: string;
  name: string;
  /** Short line for lists. */
  kind: string;
  priceFrom: string;
  typicalHome: string;
  toAirport: string;
  /** Rough gross rental yield, as quoted by agents. */
  yield: string;
  metro: string;
  beach: string;
  why: string;
  photo: string;
  /** [lng, lat] */
  at: [number, number];
  /** Which lifestyle filters this community suits best. */
  suits: Lifestyle[];
};

export type Lifestyle = "beach" | "city" | "green" | "family";

export const lifestyles: { id: Lifestyle; label: string }[] = [
  { id: "beach", label: "Beach on the doorstep" },
  { id: "city", label: "Walk to the city" },
  { id: "green", label: "Golf and gardens" },
  { id: "family", label: "Room for a family" },
];

export const communities: Community[] = [
  {
    id: "palm",
    name: "Palm Jumeirah",
    kind: "Beachfront villas and apartments",
    priceFrom: "AED 2.5M",
    typicalHome: "Beach villa or sea-view apartment",
    toAirport: "35 min to DXB",
    yield: "about 5%",
    metro: "Monorail to the Marina",
    beach: "Private beach on most fronds",
    why: "Your own stretch of sand, ten minutes from the Marina.",
    photo: "photo-1682410601760-6372fd33ad2b",
    at: [55.1385, 25.1124],
    suits: ["beach", "family"],
  },
  {
    id: "downtown",
    name: "Downtown Dubai",
    kind: "Apartments by the Burj Khalifa",
    priceFrom: "AED 1.6M",
    typicalHome: "1 to 3 bed apartment with a Burj view",
    toAirport: "15 min to DXB",
    yield: "about 6%",
    metro: "Burj Khalifa / Dubai Mall station",
    beach: "15 min drive",
    why: "Dubai Mall, the fountain and the Opera on foot.",
    photo: "photo-1634007626524-f47fa37810a7",
    at: [55.2744, 25.1972],
    suits: ["city"],
  },
  {
    id: "marina",
    name: "Dubai Marina",
    kind: "Waterfront towers",
    priceFrom: "AED 1.3M",
    typicalHome: "Apartment over the marina",
    toAirport: "35 min to DXB",
    yield: "about 7%",
    metro: "Metro and tram",
    beach: "JBR beach, 5 min walk",
    why: "The marina walk, JBR beach and the tram outside.",
    photo: "photo-1722502831677-74729ac2eb78",
    at: [55.1406, 25.0805],
    suits: ["beach", "city"],
  },
  {
    id: "hills",
    name: "Dubai Hills Estate",
    kind: "Villas on the golf course",
    priceFrom: "AED 5M",
    typicalHome: "4 to 6 bed villa with a garden",
    toAirport: "25 min to DXB",
    yield: "about 5%",
    metro: "No metro, 10 min drive",
    beach: "20 min drive",
    why: "Golf, parks and good schools inside the gates.",
    photo: "photo-1782720829237-ec146b0afe0a",
    at: [55.2453, 25.1105],
    suits: ["green", "family"],
  },
  {
    id: "creek",
    name: "Dubai Creek Harbour",
    kind: "New towers on the creek",
    priceFrom: "AED 1.4M",
    typicalHome: "Off-plan apartment with a skyline view",
    toAirport: "10 min to DXB",
    yield: "about 6%",
    metro: "Creek station (planned)",
    beach: "25 min drive",
    why: "The skyline across the water and a nature reserve next door.",
    photo: "photo-1706798636475-882837a93f94",
    at: [55.3487, 25.2008],
    suits: ["city", "green"],
  },
  {
    id: "ranches",
    name: "Arabian Ranches",
    kind: "Family villas",
    priceFrom: "AED 3.8M",
    typicalHome: "3 to 5 bed villa near the school",
    toAirport: "30 min to DXB",
    yield: "about 5%",
    metro: "No metro",
    beach: "30 min drive",
    why: "Quiet streets, a golf club and schools within the community.",
    photo: "photo-1788022886933-fdce4bafb551",
    at: [55.2687, 25.0549],
    suits: ["family", "green"],
  },
];
