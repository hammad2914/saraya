"use client";

import { List, Map as MapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { communities } from "@/content/communities";
import { type Deal, dealLabels, type Home, homes, type Kind, kinds } from "@/content/homes";
import { Dropdown } from "./dropdown";
import { HomeCard } from "./home-card";
import { HomesMap } from "./homes-map";

const ANY = "any";

/** Price bands: sale prices for buy and off-plan, yearly rent for rent. */
const bands: Record<"sale" | "rent", { label: string; min: number; max: number }[]> = {
  sale: [
    { label: "Under AED 3M", min: 0, max: 3_000_000 },
    { label: "AED 3M to 8M", min: 3_000_000, max: 8_000_000 },
    { label: "AED 8M to 20M", min: 8_000_000, max: 20_000_000 },
    { label: "Over AED 20M", min: 20_000_000, max: Infinity },
  ],
  rent: [
    { label: "Under AED 200K a year", min: 0, max: 200_000 },
    { label: "AED 200K to 500K", min: 200_000, max: 500_000 },
    { label: "Over AED 500K a year", min: 500_000, max: Infinity },
  ],
};

const sorts = {
  new: { label: "Newest first", by: (a: Home, b: Home) => a.listed - b.listed },
  low: { label: "Price, low to high", by: (a: Home, b: Home) => a.price - b.price },
  high: { label: "Price, high to low", by: (a: Home, b: Home) => b.price - a.price },
  size: { label: "Largest first", by: (a: Home, b: Home) => b.sqft - a.sqft },
};
type Sort = keyof typeof sorts;

export type MarketQuery = { deal?: string; community?: string; kind?: string; beds?: string; price?: string; sort?: string };

type Filters = { deal: Deal; community: string; kind: string; beds: number; price: string };

/** Does a home pass these filters? Used for the list and for each option's count. */
function matches(h: Home, f: Filters) {
  const band = bands[f.deal === "rent" ? "rent" : "sale"][Number(f.price)];
  return (
    h.deal === f.deal &&
    (f.community === ANY || h.community === f.community) &&
    (f.kind === ANY || h.kind === f.kind) &&
    h.beds >= f.beds &&
    (!band || (h.price >= band.min && h.price < band.max))
  );
}

/**
 * Every home on the market: filter by deal, area, type, bedrooms and price,
 * sort, and see the results on a map beside the list. Filters live in the URL,
 * so a filtered view can be shared or linked to from anywhere on the site.
 */
export function Market({ initial }: { initial: MarketQuery }) {
  const [deal, setDeal] = useState<Deal>(initial.deal && initial.deal in dealLabels ? (initial.deal as Deal) : "buy");
  const [community, setCommunity] = useState(communities.some((c) => c.id === initial.community) ? initial.community! : ANY);
  const [kind, setKind] = useState<Kind | typeof ANY>(kinds.includes(initial.kind as Kind) ? (initial.kind as Kind) : ANY);
  const [beds, setBeds] = useState(Number(initial.beds) || 0);
  const [price, setPrice] = useState(initial.price ?? ANY);
  const [sort, setSort] = useState<Sort>(initial.sort && initial.sort in sorts ? (initial.sort as Sort) : "new");
  const [view, setView] = useState<"list" | "map">("list");
  const [hot, setHot] = useState<string | null>(null);

  const f: Filters = { deal, community, kind, beds, price };
  // How many homes an option would leave, with the other filters as they are.
  const count = (change: Partial<Filters>) => homes.filter((h) => matches(h, { ...f, ...change })).length;

  // A new list only when a filter changes (not on hover), so the map doesn't re-frame needlessly.
  const list = useMemo(
    () => homes.filter((h) => matches(h, { deal, community, kind, beds, price })).sort(sorts[sort].by),
    [deal, community, kind, beds, price, sort],
  );

  // Keep the address bar in step, without adding a history entry per click.
  useEffect(() => {
    const q = new URLSearchParams();
    q.set("deal", deal);
    if (community !== ANY) q.set("community", community);
    if (kind !== ANY) q.set("kind", kind);
    if (beds) q.set("beds", String(beds));
    if (price !== ANY) q.set("price", price);
    if (sort !== "new") q.set("sort", sort);
    window.history.replaceState(null, "", `/homes?${q}`);
  }, [deal, community, kind, beds, price, sort]);

  const filtered = community !== ANY || kind !== ANY || beds > 0 || price !== ANY;
  const clear = () => {
    setCommunity(ANY);
    setKind(ANY);
    setBeds(0);
    setPrice(ANY);
  };
  const where = community === ANY ? "Dubai" : communities.find((c) => c.id === community)!.name;
  const what = deal === "rent" ? "to rent" : deal === "offplan" ? "off-plan" : "for sale";

  return (
    <main className="bg-[#f4eee5] px-5 pt-[96px] pb-16 md:px-10 md:pt-[124px]">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <p className="text-[13px] font-bold tracking-[0.2em] text-gold-dark">THE MARKET</p>
            <h1 className="mt-2 font-display text-[clamp(38px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.02em]">
              Homes {what} in {where}
            </h1>
          </div>
          <div className="inline-flex rounded-full bg-white p-1" role="group" aria-label="Buy, rent or off-plan">
            {(Object.keys(dealLabels) as Deal[]).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={d === deal}
                onClick={() => {
                  setDeal(d);
                  setPrice(ANY); // sale and rent prices use different bands
                }}
                className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${d === deal ? "bg-ink text-ivory" : "text-ink/70 hover:text-ink"}`}
              >
                {dealLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="-mx-5 mt-7 flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          <Dropdown
            label="Area"
            value={community}
            onChange={setCommunity}
            active={community !== ANY}
            options={[
              { value: ANY, label: "All areas", count: count({ community: ANY }) },
              ...communities.map((c) => ({ value: c.id, label: c.name, count: count({ community: c.id }) })),
            ]}
          />
          <Dropdown
            label="Type"
            value={kind}
            onChange={(v) => setKind(v as Kind)}
            active={kind !== ANY}
            options={[
              { value: ANY, label: "Any type", count: count({ kind: ANY }) },
              ...kinds.map((k) => ({ value: k, label: `${k}s`, count: count({ kind: k }) })),
            ]}
          />
          <Dropdown
            label="Bedrooms"
            value={beds ? String(beds) : ANY}
            onChange={(v) => setBeds(v === ANY ? 0 : +v)}
            active={beds > 0}
            options={[
              { value: ANY, label: "Any beds", count: count({ beds: 0 }) },
              ...[1, 2, 3, 4, 5, 6].map((b) => ({ value: String(b), label: `${b}+ beds`, count: count({ beds: b }) })),
            ]}
          />
          <Dropdown
            label="Price"
            value={price}
            onChange={setPrice}
            active={price !== ANY}
            options={[
              { value: ANY, label: "Any price", count: count({ price: ANY }) },
              ...bands[deal === "rent" ? "rent" : "sale"].map((b, i) => ({ value: String(i), label: b.label, count: count({ price: String(i) }) })),
            ]}
          />
          {filtered && (
            <button type="button" onClick={clear} className="shrink-0 px-3 py-2.5 text-[14px] font-semibold text-gold-dark underline-offset-4 hover:underline">
              Clear filters
            </button>
          )}
        </div>

        <div id="results" className="mt-6 flex scroll-mt-[90px] items-center justify-between gap-4 border-t border-ink/10 pt-5">
          <p className="text-[14.5px] text-ink/70">
            <b className="text-ink">{list.length}</b> {list.length === 1 ? "home" : "homes"}
            <span className="max-sm:hidden">{deal === "rent" ? ", rent shown per year" : ""}</span>
          </p>
          <div className="flex items-center gap-2">
            <Dropdown
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as Sort)}
              active={false}
              align="right"
              options={(Object.keys(sorts) as Sort[]).map((s) => ({ value: s, label: sorts[s].label }))}
            />
            {/* Phones show the list or the map, one at a time */}
            <button
              type="button"
              onClick={() => {
                setView(view === "list" ? "map" : "list");
                // Bring the results to the top so the map fills the screen below them.
                document.getElementById("results")?.scrollIntoView();
              }}
              className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-semibold text-ivory lg:hidden"
            >
              {view === "list" ? <MapIcon className="size-4" /> : <List className="size-4" />}
              {view === "list" ? "Map" : "List"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:items-start">
          <div className={view === "map" ? "max-lg:hidden" : ""}>
            <div key={deal + community + kind + beds + price + sort} className="grid gap-5 sm:grid-cols-2">
              {list.map((h) => (
                <HomeCard key={h.id} h={h} onHover={setHot} />
              ))}
            </div>
            {!list.length && (
              <div className="rounded-[22px] bg-white p-10 text-center">
                <p className="text-[16px] text-stone">No homes match all of those. Try fewer filters.</p>
                <button type="button" onClick={clear} className="mt-4 rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-ivory">
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <HomesMap
            list={list}
            hot={hot}
            cooperative={false}
            className={`h-[calc(100svh-190px)] overflow-hidden rounded-[24px] bg-sand lg:sticky lg:top-[112px] lg:block lg:h-[calc(100svh-136px)] ${view === "map" ? "" : "max-lg:hidden"}`}
          />
        </div>
        <p className="mt-6 text-[12.5px] text-stone">Listings in this concept are examples. Photos from Unsplash.</p>
      </div>
    </main>
  );
}
