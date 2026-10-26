/**
 * Homes on the market: fictional listings for the concept, with real Unsplash
 * photos. Prices are pitched at typical 2026 asking prices for each area.
 */
export type Deal = "buy" | "rent" | "offplan";
export type Kind = "Villa" | "Apartment" | "Penthouse" | "Townhouse";

export type Home = {
  id: string;
  name: string;
  kind: Kind;
  /** Where it is, as people say it ("JBR", "Business Bay"). */
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
  /** A short paragraph for the home's own page. */
  about: string;
  features: string[];
  /** [lng, lat] */
  at: [number, number];
  /** Days since it was listed. */
  listed: number;
  /** Year built; off-plan homes have a handover instead. */
  built?: number;
  /** Off-plan only: when the keys are handed over, and how the price is paid. */
  handover?: string;
  plan?: { booking: number; building: number; handover: number };
  photos: { id: string; room: string }[];
};

// Room photos shared across listings (Unsplash ids).
const LIVING = [
  "photo-1583847268964-b28dc8f51f92",
  "photo-1564078516393-cf04bd966897",
  "photo-1758448511322-8bfc73daf606",
  "photo-1598928506311-c55ded91a20c",
  "photo-1618221195710-dd6b41faaea6",
  "photo-1758565811176-ccd94357a844",
  "photo-1757524503555-b62633f47670",
  "photo-1599696848652-f0ff23bc911f",
  "photo-1768144092684-c1a5dd6c7aad",
  "photo-1613545325278-f24b0cae1224",
  "photo-1682184805271-11671b7ecf4c",
  "photo-1654520015092-b9b4ddf2e7c7",
];
const BEDROOM = [
  "photo-1578683010236-d716f9a3f461",
  "photo-1616594039964-ae9021a400a0",
  "photo-1765862835260-47843a7bba45",
  "photo-1784653549288-07343300a44f",
  "photo-1566665797739-1674de7a421a",
  "photo-1778731525620-ae459167c176",
  "photo-1618221118493-9cfa1a1c00da",
  "photo-1765862835319-18fb6f8caff6",
  "photo-1617098900591-3f90928e8c54",
];
const KITCHEN = [
  "photo-1696986681606-b156ccd761c5",
  "photo-1628745277862-bc0b2d68c50c",
  "photo-1778731660397-6a66493be391",
  "photo-1632583824020-937ae9564495",
  "photo-1786053538161-501fbdd89629",
  "photo-1611095210561-67f0832b1ca3",
  "photo-1622372738946-62e02505feb3",
  "photo-1785535573585-8f962fa3cda5",
  "photo-1683629357963-adf2b1fa9ad9",
  "photo-1785535573676-5dafa00b3c8b",
  "photo-1686023858216-4f54c853acf2",
];
const BATH = [
  "photo-1631889993959-41b4e9c6e3c5",
  "photo-1781344334947-60c704bafd51",
  "photo-1661107259637-4e1c55462428",
  "photo-1507652313519-d4e9174996dd",
  "photo-1776525433347-13ffc965601a",
  "photo-1576698483491-8c43f0862543",
  "photo-1696987007764-7f8b85dd3033",
  "photo-1765745518673-b562b7304a53",
  "photo-1733426107854-ee00a25d72a7",
  "photo-1603825491103-bd638b1873b0",
  "photo-1638799869566-b17fa794c4de",
];

const baseFeatures: Record<Kind, string[]> = {
  Villa: ["Private pool", "Garden", "Maid's room", "Covered parking for 3"],
  Townhouse: ["Small garden", "Community pool", "Parking for 2"],
  Apartment: ["Balcony", "Pool and gym in the building", "Concierge", "1 parking space"],
  Penthouse: ["Private terrace", "Plunge pool", "Concierge", "Parking for 2"],
};

type Row = Omit<Home, "photos" | "features" | "listed"> & {
  cover: [string, string];
  /** Extra photos before the shared room photos (a view, a terrace). */
  extra?: [string, string][];
  more?: string[];
};

/** Builds a listing: the cover first, then a living room, kitchen, bedroom and bathroom. */
function make(r: Row, i: number): Home {
  const { cover, extra = [], more = [], ...rest } = r;
  const pick = (pool: string[], step: number) => pool[(i * step + 3) % pool.length];
  return {
    ...rest,
    listed: (i * 7 + 2) % 46,
    features: [...more, ...baseFeatures[r.kind]],
    photos: [
      { id: cover[0], room: cover[1] },
      ...extra.map(([id, room]) => ({ id, room })),
      { id: pick(LIVING, 5), room: "Living room" },
      { id: pick(KITCHEN, 7), room: "Kitchen" },
      { id: pick(BEDROOM, 4), room: "Main bedroom" },
      { id: pick(BATH, 3), room: "Bathroom" },
    ],
  };
}

const rows: Row[] = [
  // ---------- Downtown and Business Bay ----------
  {
    id: "burj-view", name: "Burj View Residence", kind: "Apartment", area: "Downtown", community: "downtown", deal: "buy",
    price: 6_900_000, beds: 3, baths: 4, sqft: 2_350, built: 2019, at: [55.2795, 25.1948],
    hook: "Floor 41, the Burj Khalifa fills the living-room window",
    about: "A corner apartment high above the Boulevard. The living room and main bedroom both face the Burj Khalifa, and the fountain show is a short walk away.",
    cover: ["photo-1721804222945-e443900b382a", "The view"], more: ["Burj Khalifa view", "Floor-to-ceiling windows"],
  },
  {
    id: "boulevard-two", name: "Boulevard Two-Bed", kind: "Apartment", area: "Downtown", community: "downtown", deal: "buy",
    price: 3_200_000, beds: 2, baths: 3, sqft: 1_350, built: 2016, at: [55.2812, 25.1975],
    hook: "Walk to Dubai Mall and the metro, rented until March",
    about: "A bright two-bed on the Boulevard, let to a long-term tenant until March. Buy it as an investment now, or move in next spring.",
    cover: ["photo-1544092683-c0c9ebb368e5", "The street"], more: ["Tenanted until March", "Walk to the metro"],
  },
  {
    id: "old-town", name: "Old Town Apartment", kind: "Apartment", area: "Downtown", community: "downtown", deal: "buy",
    price: 2_600_000, beds: 2, baths: 2, sqft: 1_420, built: 2009, at: [55.2771, 25.1922],
    hook: "Low-rise and quiet, with Arabic-style courtyards",
    about: "One of the low-rise Old Town buildings, with shaded courtyards and a fountain. Quieter than the towers, still five minutes on foot to the mall.",
    cover: ["photo-1698948684109-01de0994a832", "Old Town"], more: ["Courtyard garden"],
  },
  {
    id: "fountain-penthouse", name: "Fountain View Penthouse", kind: "Penthouse", area: "Downtown", community: "downtown", deal: "buy",
    price: 19_500_000, beds: 4, baths: 5, sqft: 5_200, built: 2021, at: [55.2733, 25.1994],
    hook: "Watch the fountain show from your own terrace",
    about: "The top two floors of a boutique tower facing the Dubai Fountain. A wraparound terrace, a plunge pool and a private lift lobby.",
    cover: ["photo-1617449512807-7401d38e5c29", "The fountain"], extra: [["photo-1681194189961-e2aa414f9c7f", "Terrace"]],
    more: ["Fountain view", "Private lift"],
  },
  {
    id: "boulevard-rent", name: "One-Bed on the Boulevard", kind: "Apartment", area: "Downtown", community: "downtown", deal: "rent",
    price: 140_000, beds: 1, baths: 2, sqft: 880, built: 2015, at: [55.2758, 25.2012],
    hook: "Furnished, bills split, free from 1 December",
    about: "A furnished one-bed with a balcony over the Boulevard. Rent can be paid in four cheques.",
    cover: ["photo-1637739256584-43c96dac387f", "At night"], more: ["Furnished", "4 cheques"],
  },
  {
    id: "canal-rent", name: "Canal-Side Apartment", kind: "Apartment", area: "Business Bay", community: "downtown", deal: "rent",
    price: 185_000, beds: 2, baths: 3, sqft: 1_300, built: 2018, at: [55.2585, 25.1892],
    hook: "On the water taxi route, ten minutes to DIFC",
    about: "A two-bed facing the Dubai Water Canal, with the running track below. Unfurnished, available now.",
    cover: ["photo-1745750434535-5943ef2fd31a", "Business Bay"], more: ["Canal view"],
  },
  {
    id: "bay-loft", name: "Bay Square Loft", kind: "Apartment", area: "Business Bay", community: "downtown", deal: "buy",
    price: 1_900_000, beds: 1, baths: 2, sqft: 1_050, built: 2017, at: [55.2702, 25.1888],
    hook: "Double-height living room, a strong first rental",
    about: "A one-bed loft with a double-height living room. One-beds here typically rent for around 7% of their price a year.",
    cover: ["photo-1732775636031-4a99486c8a58", "The skyline"], more: ["Double-height ceiling"],
  },
  {
    id: "sky-pool", name: "One Sky Residences", kind: "Apartment", area: "Business Bay", community: "downtown", deal: "offplan",
    price: 3_800_000, beds: 3, baths: 3, sqft: 1_900, handover: "Q2 2028", plan: { booking: 20, building: 40, handover: 40 }, at: [55.2655, 25.1869],
    hook: "Rooftop infinity pool, ten minutes to DIFC",
    about: "A new tower on the Business Bay waterfront, with a rooftop infinity pool and residents' club. Pay 60% while it is built and 40% on handover.",
    cover: ["photo-1695461059878-9b07de810ddd", "Rooftop pool (render)"], more: ["Rooftop infinity pool"],
  },

  // ---------- Palm Jumeirah ----------
  {
    id: "frond-villa", name: "Frond Beach Villa", kind: "Villa", area: "Palm Jumeirah", community: "palm", deal: "buy",
    price: 32_000_000, beds: 6, baths: 7, sqft: 7_800, built: 2020, at: [55.1431, 25.1157],
    hook: "Private beach, pool and a jetty on the frond",
    about: "A rebuilt frond villa with 70 metres of private beach. The living rooms open straight onto the pool deck and the sea.",
    cover: ["photo-1602343168117-bb8ffe3e2e9f", "Pool and garden"], more: ["Private beach", "Sea view", "Jetty"],
  },
  {
    id: "signature-villa", name: "Signature Villa, Frond K", kind: "Villa", area: "Palm Jumeirah", community: "palm", deal: "buy",
    price: 45_000_000, beds: 7, baths: 8, sqft: 11_200, built: 2023, at: [55.1316, 25.1196],
    hook: "Curved white architecture, cinema and wine room",
    about: "One of the Signature Villas at the tip of the frond, finished in 2023. Seven en-suite bedrooms, a cinema, a wine room and a lift to every floor.",
    cover: ["photo-1622015663319-e97e697503ee", "The villa"], more: ["Private beach", "Cinema room", "Lift"],
  },
  {
    id: "frond-garden", name: "Garden Home, Frond C", kind: "Villa", area: "Palm Jumeirah", community: "palm", deal: "buy",
    price: 21_000_000, beds: 5, baths: 6, sqft: 6_300, built: 2008, at: [55.1452, 25.1080],
    hook: "Original Palm villa, upgraded inside, mature garden",
    about: "An original garden home, fully upgraded inside in 2022. Mature palms, a family-sized pool and a short walk to the beach.",
    cover: ["photo-1790276319523-66db7433ad78", "The front"], more: ["Beach access", "Upgraded in 2022"],
  },
  {
    id: "shoreline", name: "Shoreline Apartment", kind: "Apartment", area: "Palm Jumeirah", community: "palm", deal: "buy",
    price: 3_900_000, beds: 2, baths: 3, sqft: 1_650, built: 2008, at: [55.1405, 25.1105],
    hook: "Beach club and pool downstairs, view of the Marina",
    about: "A two-bed in the Shoreline buildings on the trunk, with its own beach club. The balcony looks back across the water to the Marina.",
    cover: ["photo-1721719651045-f8af4642edca", "The beach"], extra: [["photo-1722502831765-e11188565aad", "The view"]], more: ["Beach club", "Sea view"],
  },
  {
    id: "palm-tower-ph", name: "Palm Tower Penthouse", kind: "Penthouse", area: "Palm Jumeirah", community: "palm", deal: "buy",
    price: 26_000_000, beds: 4, baths: 5, sqft: 6_100, built: 2020, at: [55.1381, 25.1135],
    hook: "Top of the tower, the whole Palm laid out below",
    about: "A full-floor penthouse near the top of the trunk's tallest tower, with views over every frond, the Gulf and the Marina skyline.",
    cover: ["photo-1639626217903-df23e66c3530", "The tower"], extra: [["photo-1681194189961-e2aa414f9c7f", "Terrace"]], more: ["360° view", "Private lift"],
  },
  {
    id: "crescent-rent", name: "Crescent Residence", kind: "Apartment", area: "Palm Jumeirah", community: "palm", deal: "rent",
    price: 420_000, beds: 3, baths: 4, sqft: 2_400, built: 2014, at: [55.1268, 25.1300],
    hook: "On the crescent, hotel services, available January",
    about: "A serviced three-bed on the crescent, with housekeeping and the hotel's restaurants and beach included.",
    cover: ["photo-1600450575743-43793ba079d3", "The crescent"], more: ["Serviced", "Furnished", "Sea view"],
  },
  {
    id: "palm-villa-rent", name: "Palm Beach Villa to Rent", kind: "Villa", area: "Palm Jumeirah", community: "palm", deal: "rent",
    price: 1_400_000, beds: 5, baths: 6, sqft: 6_000, built: 2007, at: [55.1334, 25.1108],
    hook: "Beach and pool, one year or longer",
    about: "A five-bed frond villa with its own beach, available on a one-year lease. Pool and garden maintenance included.",
    cover: ["photo-1613490493576-7fde63acd811", "Pool and house"], more: ["Private beach", "Garden care included"],
  },
  {
    id: "royal-crescent", name: "Royal Crescent Residences", kind: "Apartment", area: "Palm Jumeirah", community: "palm", deal: "offplan",
    price: 8_500_000, beds: 3, baths: 4, sqft: 2_600, handover: "Q3 2028", plan: { booking: 20, building: 50, handover: 30 }, at: [55.1225, 25.1270],
    hook: "Branded residences on the crescent, keys in 2028",
    about: "Hotel-branded apartments on the crescent with a private beach, residents' spa and sea views from every room.",
    cover: ["photo-1656994866257-760d6ee0fae6", "The towers"], more: ["Branded residence", "Private beach"],
  },

  // ---------- Dubai Marina and JBR ----------
  {
    id: "marina-penthouse", name: "Marina Waterfront Penthouse", kind: "Penthouse", area: "Dubai Marina", community: "marina", deal: "buy",
    price: 12_500_000, beds: 4, baths: 5, sqft: 4_100, built: 2015, at: [55.1452, 25.0842],
    hook: "Wraparound terrace over the yachts and the Palm",
    about: "A penthouse with a terrace on three sides: yachts below, the Palm to the north and the Gulf at sunset.",
    cover: ["photo-1722502831572-2d12e8f30c59", "The view"], more: ["Marina view", "Sea view"],
  },
  {
    id: "promenade", name: "Marina Promenade Apartment", kind: "Apartment", area: "Dubai Marina", community: "marina", deal: "buy",
    price: 2_100_000, beds: 2, baths: 2, sqft: 1_250, built: 2007, at: [55.1416, 25.0766],
    hook: "On the marina walk, cafes at the door",
    about: "A two-bed on the marina walk with the tram and metro close by. Popular with tenants, so it rarely sits empty.",
    cover: ["photo-1722502831677-74729ac2eb78", "The marina walk"], more: ["Marina view", "Walk to the tram"],
  },
  {
    id: "canal-one", name: "Marina Canal One-Bed", kind: "Apartment", area: "Dubai Marina", community: "marina", deal: "buy",
    price: 1_600_000, beds: 1, baths: 2, sqft: 900, built: 2013, at: [55.1388, 25.0870],
    hook: "Looks onto the twisting tower, a good first buy",
    about: "A one-bed facing the marina canal and the twisting tower. A sensible first buy, at around 7% rental yield.",
    cover: ["photo-1582120042072-d01e2fc8f3ea", "The canal"],
  },
  {
    id: "jbr-beach", name: "JBR Beach Apartment", kind: "Apartment", area: "JBR", community: "marina", deal: "buy",
    price: 3_400_000, beds: 3, baths: 4, sqft: 1_950, built: 2008, at: [55.1336, 25.0793],
    hook: "Straight onto the beach and The Walk",
    about: "A three-bed in the JBR towers, with the beach and The Walk directly below and a pool deck on the podium.",
    cover: ["photo-1524234599372-a5bd0194758d", "The pool deck"], more: ["Beach access", "Sea view"],
  },
  {
    id: "jbr-rent", name: "Beachfront Apartment, JBR", kind: "Apartment", area: "JBR", community: "marina", deal: "rent",
    price: 320_000, beds: 2, baths: 3, sqft: 1_600, built: 2018, at: [55.1337, 25.0805],
    hook: "Walk out to the beach, furnished, free in December",
    about: "A furnished two-bed in a newer beachfront tower, with the beach a minute away. Free from December.",
    cover: ["photo-1737724035436-1a301aca2aa2", "The view"], more: ["Furnished", "Sea view"],
  },
  {
    id: "yacht-view", name: "Marina Yacht View", kind: "Apartment", area: "Dubai Marina", community: "marina", deal: "rent",
    price: 210_000, beds: 2, baths: 2, sqft: 1_180, built: 2010, at: [55.1428, 25.0800],
    hook: "Balcony over the yacht berths",
    about: "A two-bed with a long balcony over the yacht club berths. Unfurnished, chiller included.",
    cover: ["photo-1721977568971-f07e1aa58cf9", "The marina"], more: ["Marina view", "Chiller included"],
  },
  {
    id: "marina-sky-rent", name: "Marina Sky Penthouse", kind: "Penthouse", area: "Dubai Marina", community: "marina", deal: "rent",
    price: 650_000, beds: 4, baths: 5, sqft: 4_300, built: 2012, at: [55.1474, 25.0884],
    hook: "Furnished penthouse, sea and Palm view",
    about: "A furnished four-bed penthouse at the top of Marina Gate, with a terrace looking across to the Palm and Ain Dubai.",
    cover: ["photo-1721719650635-4fd149f8e0bd", "The towers"], more: ["Furnished", "Sea view"],
  },
  {
    id: "beachfront-c", name: "Beachfront Tower C", kind: "Apartment", area: "Dubai Marina", community: "marina", deal: "offplan",
    price: 3_100_000, beds: 2, baths: 3, sqft: 1_300, handover: "Q1 2028", plan: { booking: 10, building: 50, handover: 40 }, at: [55.1431, 25.0938],
    hook: "Island towers with their own beach, between the Marina and the Palm",
    about: "On the beachfront island between the Marina and the Palm, with its own private beach. Ten percent books it.",
    cover: ["photo-1722502831726-6cea3afa8ced", "The location"], more: ["Private beach", "Sea view"],
  },

  // ---------- Dubai Hills ----------
  {
    id: "hills-villa", name: "Hills Park Villa", kind: "Villa", area: "Dubai Hills", community: "hills", deal: "buy",
    price: 11_200_000, beds: 5, baths: 6, sqft: 5_600, built: 2019, at: [55.2468, 25.1122],
    hook: "Backs onto the park, five minutes to the school",
    about: "A modern five-bed backing directly onto the central park, five minutes from two of the city's most popular schools.",
    cover: ["photo-1613977257363-707ba9348227", "Front"],
    extra: [["photo-1613977257592-4871e5fcd7c4", "Pool"], ["photo-1613977257365-aaae5a9817ff", "Terrace"]], more: ["Park view", "Near schools"],
  },
  {
    id: "golf-place", name: "Golf Place Villa", kind: "Villa", area: "Dubai Hills", community: "hills", deal: "buy",
    price: 16_000_000, beds: 6, baths: 7, sqft: 8_400, built: 2020, at: [55.2392, 25.1018],
    hook: "On the 18-hole course, guest wing over the garage",
    about: "A six-bed on the championship golf course with a separate guest wing, a gym and a garden that runs down to the fairway.",
    cover: ["photo-1600596542815-ffad4c1539a9", "Pool and house"], more: ["Golf course view", "Guest wing"],
  },
  {
    id: "hills-garden", name: "Hills Garden Villa", kind: "Villa", area: "Dubai Hills", community: "hills", deal: "buy",
    price: 9_400_000, beds: 5, baths: 6, sqft: 5_100, built: 2021, at: [55.2531, 25.1176],
    hook: "Corner plot, the biggest garden on the street",
    about: "A five-bed on a corner plot with a large lawn, a pool and an outdoor kitchen.",
    cover: ["photo-1660361338517-8c8fbb3ac264", "Pool and house"], more: ["Corner plot", "Outdoor kitchen"],
  },
  {
    id: "parkside-th", name: "Parkside Townhouse", kind: "Townhouse", area: "Dubai Hills", community: "hills", deal: "buy",
    price: 4_600_000, beds: 4, baths: 4, sqft: 2_900, built: 2022, at: [55.2416, 25.1189],
    hook: "Four floors, roof terrace, the park at the end of the road",
    about: "A four-bed townhouse with a roof terrace and a lift, at the quiet end of a street that runs onto the park.",
    cover: ["photo-1778375744848-e7757f0254e6", "The front"], more: ["Roof terrace", "Park view"],
  },
  {
    id: "villa-rent", name: "Garden Villa for Rent", kind: "Villa", area: "Dubai Hills", community: "hills", deal: "rent",
    price: 650_000, beds: 5, baths: 6, sqft: 5_200, built: 2019, at: [55.2493, 25.1062],
    hook: "Pool, maid's room, one year or longer",
    about: "A five-bed villa with a pool, available on a one-year lease. Two minutes' drive to Dubai Hills Mall.",
    cover: ["photo-1580587771525-78b9dba3b914", "Pool and house"],
  },
  {
    id: "maple-rent", name: "Maple Townhouse to Rent", kind: "Townhouse", area: "Dubai Hills", community: "hills", deal: "rent",
    price: 260_000, beds: 3, baths: 4, sqft: 2_300, built: 2018, at: [55.2560, 25.1050],
    hook: "Family townhouse beside the community pool",
    about: "A three-bed townhouse next to the community pool and play park. Free from mid-December.",
    cover: ["photo-1624343385944-b99336163b50", "The street"], more: ["Next to the play park"],
  },
  {
    id: "hills-edge", name: "Hills Edge Villas", kind: "Villa", area: "Dubai Hills", community: "hills", deal: "offplan",
    price: 7_800_000, beds: 4, baths: 5, sqft: 4_200, handover: "Q4 2027", plan: { booking: 10, building: 60, handover: 30 }, at: [55.2350, 25.1140],
    hook: "Last phase of villas in the Hills, building now",
    about: "The final phase of villas in Dubai Hills, already under construction. Pick your finishes while it is built.",
    cover: ["photo-1743819344477-3b67c19621e9", "On site, October"], more: ["Choose your finishes"],
  },

  // ---------- Dubai Creek Harbour ----------
  {
    id: "creek-island", name: "Creek Island Apartment", kind: "Apartment", area: "Creek Harbour", community: "creek", deal: "buy",
    price: 2_300_000, beds: 2, baths: 2, sqft: 1_200, built: 2023, at: [55.3472, 25.2034],
    hook: "Sunsets over the Creek and the skyline",
    about: "A two-bed in one of the newest Creek Harbour towers, looking west over the water to the Downtown skyline.",
    cover: ["photo-1701956461921-222fca3dcd23", "The Creek"], more: ["Skyline view"],
  },
  {
    id: "harbour-ph", name: "Harbour Views Penthouse", kind: "Penthouse", area: "Creek Harbour", community: "creek", deal: "buy",
    price: 7_900_000, beds: 4, baths: 5, sqft: 3_800, built: 2022, at: [55.3500, 25.1990],
    hook: "Two floors, the Burj Khalifa straight ahead",
    about: "A duplex penthouse with the Burj Khalifa framed in the living-room window and the wildlife sanctuary behind.",
    cover: ["photo-1619630223787-d7a22d1c6014", "The tower"], extra: [["photo-1636801686436-bcb8eae09a41", "The view"]], more: ["Burj Khalifa view", "Duplex"],
  },
  {
    id: "creek-rise-rent", name: "Creek Rise Apartment", kind: "Apartment", area: "Creek Harbour", community: "creek", deal: "rent",
    price: 150_000, beds: 2, baths: 2, sqft: 1_150, built: 2021, at: [55.3454, 25.1992],
    hook: "New building, quiet, a promenade on the water",
    about: "A two-bed in a new building beside the Creek promenade. Quiet, green and twenty minutes to the airport.",
    cover: ["photo-1642137470505-c2f85c227ab8", "The towers"], more: ["Near the airport"],
  },
  {
    id: "creek-tower", name: "Creek Edge, Tower B", kind: "Apartment", area: "Creek Harbour", community: "creek", deal: "offplan",
    price: 2_400_000, beds: 2, baths: 2, sqft: 1_250, handover: "Q4 2027", plan: { booking: 20, building: 40, handover: 40 }, at: [55.3512, 25.2030],
    hook: "Skyline and Creek views, pay 60% before the keys",
    about: "A two-bed in Tower B, with skyline and Creek views. Pay 60% while it is built and 40% when you get the keys.",
    cover: ["photo-1636801686436-bcb8eae09a41", "The view"],
  },
  {
    id: "creek-gate", name: "Creek Gate Tower 2", kind: "Apartment", area: "Creek Harbour", community: "creek", deal: "offplan",
    price: 1_900_000, beds: 1, baths: 2, sqft: 850, handover: "Q2 2028", plan: { booking: 10, building: 50, handover: 40 }, at: [55.3440, 25.2042],
    hook: "Ten percent books a one-bed, keys in 2028",
    about: "A one-bed in a tower that is now rising. A small deposit books it, the rest is spread over the build.",
    cover: ["photo-1743819336189-71deffe7835b", "On site, October"],
  },

  // ---------- Arabian Ranches ----------
  {
    id: "ranches-villa", name: "Ranches Garden Villa", kind: "Villa", area: "Arabian Ranches", community: "ranches", deal: "buy",
    price: 7_400_000, beds: 4, baths: 5, sqft: 4_300, built: 2006, at: [55.2690, 25.0565],
    hook: "Big garden, quiet street, golf club at the end of it",
    about: "A four-bed on a quiet loop with a big, established garden. The golf club and the community school are walking distance.",
    cover: ["photo-1670589953882-b94c9cb380f5", "Pool and house"], more: ["Near the golf club"],
  },
  {
    id: "polo-villa", name: "Polo Club Villa", kind: "Villa", area: "Arabian Ranches", community: "ranches", deal: "buy",
    price: 12_500_000, beds: 6, baths: 7, sqft: 7_900, built: 2012, at: [55.2610, 25.0505],
    hook: "Next to the polo and equestrian club",
    about: "A six-bed on one of the largest plots in the Ranches, beside the polo and equestrian club.",
    cover: ["photo-1745761320791-5ae142edee8c", "The villa"], more: ["Large plot", "Near the equestrian club"],
  },
  {
    id: "saheel-villa", name: "Saheel Villa", kind: "Villa", area: "Arabian Ranches", community: "ranches", deal: "buy",
    price: 5_900_000, beds: 4, baths: 4, sqft: 3_900, built: 2005, at: [55.2752, 25.0592],
    hook: "Original Ranches villa with a new pool",
    about: "An original four-bed, recently updated with a new pool, kitchen and bathrooms.",
    cover: ["photo-1582268611958-ebfd161ef9cf", "Pool and house"], more: ["New pool"],
  },
  {
    id: "ranches-th", name: "Ranches Townhouse", kind: "Townhouse", area: "Arabian Ranches", community: "ranches", deal: "buy",
    price: 3_100_000, beds: 3, baths: 4, sqft: 2_400, built: 2019, at: [55.2788, 25.0520],
    hook: "Three beds and a garden for the price of a city flat",
    about: "A three-bed townhouse with a private garden and two community pools within a short walk.",
    cover: ["photo-1790214120388-944c0187239c", "The front"],
  },
  {
    id: "desert-garden-rent", name: "Desert Garden Villa", kind: "Villa", area: "Arabian Ranches", community: "ranches", deal: "rent",
    price: 380_000, beds: 4, baths: 5, sqft: 4_100, built: 2008, at: [55.2655, 25.0612],
    hook: "Four beds, pool and garden, pets welcome",
    about: "A four-bed villa with a pool and a large garden, available for a one-year lease. Pets are allowed.",
    cover: ["photo-1599777560450-e462cffc5368", "The villa"], more: ["Pets allowed"],
  },
  {
    id: "ranches-three", name: "Ranches Three, Phase 2", kind: "Townhouse", area: "Arabian Ranches", community: "ranches", deal: "offplan",
    price: 2_900_000, beds: 3, baths: 3, sqft: 2_100, handover: "Q1 2027", plan: { booking: 10, building: 70, handover: 20 }, at: [55.2850, 25.0470],
    hook: "Keys in early 2027, just 20% left at handover",
    about: "New townhouses in the third Ranches, close to finishing. Most of the price is paid during the build.",
    cover: ["photo-1706855203772-c249b75fe016", "Show home"],
  },
];

export const homes: Home[] = rows.map(make);

export const dealLabels: Record<Deal, string> = { buy: "Buy", rent: "Rent", offplan: "Off-plan" };
export const kinds: Kind[] = ["Villa", "Townhouse", "Apartment", "Penthouse"];

/** "AED 6.9M", "AED 320K a year". */
export function priceLabel(h: Pick<Home, "price" | "deal">) {
  const n = h.price >= 1_000_000 ? `${+(h.price / 1_000_000).toFixed(1)}M` : `${Math.round(h.price / 1000)}K`;
  return `AED ${n}${h.deal === "rent" ? " a year" : ""}`;
}

/** Just the number, for map pins: "6.9M", "320K". */
export const priceShort = (p: number) => (p >= 1_000_000 ? `${+(p / 1_000_000).toFixed(1)}M` : `${Math.round(p / 1000)}K`);

export const homeById = (id: string) => homes.find((h) => h.id === id);
