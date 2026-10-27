"use client";

import { Car, Check, X } from "lucide-react";
import { useState } from "react";

import { type Community, communities, photo } from "@/content/communities";
import { byCar, byMetro, hasMetro, priceFromNumber, workplaces } from "@/content/commute";

const label = "text-[13px] font-bold tracking-[0.2em] text-stone";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition ${on ? "bg-ink text-ivory" : "bg-white text-ink/75 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

type Need = "beach" | "metro" | "green" | "family";
const needs: { id: Need; label: string; has: (c: Community) => boolean }[] = [
  { id: "beach", label: "A beach nearby", has: (c) => c.suits.includes("beach") },
  { id: "metro", label: "The metro", has: hasMetro },
  { id: "green", label: "Golf and parks", has: (c) => c.suits.includes("green") },
  { id: "family", label: "Room for children", has: (c) => c.suits.includes("family") },
];

const budgets = [
  { label: "Up to AED 2M", max: 2_000_000 },
  { label: "Up to AED 4M", max: 4_000_000 },
  { label: "Up to AED 6M", max: 6_000_000 },
  { label: "No limit", max: Infinity },
];

const short = (c: Community) => c.name.replace(/^Dubai /, "").replace(/ (Estate|Dubai)$/, "");

/**
 * Where should you live: where you'll work, when you'll travel, your budget and
 * what you want nearby give one best match with its reasons, then every other
 * area ranked, with its drive to work as a bar.
 */
export function AreaMatch() {
  const [w, setW] = useState(workplaces[0]);
  const [rush, setRush] = useState(false);
  const [budget, setBudget] = useState(1);
  const [want, setWant] = useState<Need[]>(["beach"]);
  const toggle = (n: Need) => setWant((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n]));

  // Areas in budget come first; then each wish met is worth 2 points, and every 15 minutes of driving costs 1.
  const ranked = communities
    .map((c) => {
      const met = needs.filter((n) => want.includes(n.id)).map((n) => ({ n, ok: n.has(c) }));
      const mins = byCar(c, w, rush);
      const metro = byMetro(c, w);
      const afford = priceFromNumber(c) <= budgets[budget].max;
      const best = Math.min(mins, metro ?? Infinity);
      return { c, met, mins, metro, afford, score: met.filter((x) => x.ok).length * 2 - best / 15 + (afford ? 10 : 0) };
    })
    .sort((x, y) => y.score - x.score);
  const [top, ...rest] = ranked;
  const longest = Math.max(60, ...ranked.map((r) => r.mins));

  return (
    <section id="where-to-live" className="scroll-mt-16 bg-[#f4eee5] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">Where should you live?</h2>
          <p className="max-w-[420px] text-[15.5px] leading-relaxed text-ink/70">
            Tell us where you&apos;ll work and what you want nearby. Every area is ranked, with the drive to work worked out from the map.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="grid gap-7 lg:sticky lg:top-28">
            <div>
              <p className={label}>WHERE WILL YOU WORK</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workplaces.map((x) => (
                  <Chip key={x.id} on={w.id === x.id} onClick={() => setW(x)}>
                    {x.short}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className={label}>WHEN DO YOU LEAVE</p>
              <div className="mt-3 inline-flex rounded-full bg-white p-1" role="group" aria-label="When you travel">
                {(
                  [
                    ["Off-peak", false],
                    ["8am rush", true],
                  ] as const
                ).map(([t, r]) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={rush === r}
                    onClick={() => setRush(r)}
                    className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${rush === r ? "bg-ink text-ivory" : "text-ink/70"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={label}>YOUR BUDGET</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {budgets.map((b, i) => (
                  <Chip key={b.label} on={budget === i} onClick={() => setBudget(i)}>
                    {b.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className={label}>YOU WANT</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {needs.map((n) => (
                  <Chip key={n.id} on={want.includes(n.id)} onClick={() => toggle(n.id)}>
                    {n.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div>
            {/* The best match */}
            <article key={top.c.id} className="animate-[rise_.5s_var(--ease-out-soft)] overflow-hidden rounded-[26px] bg-white shadow-[0_40px_80px_-50px_rgb(40_28_16/0.6)]">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                <img src={photo(top.c.photo, 1100)} alt={top.c.name} className="aspect-[16/8] w-full bg-sand object-cover text-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold tracking-[0.12em] text-gold-dark">YOUR BEST MATCH</span>
              </div>
              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-[clamp(28px,3vw,40px)] leading-none font-semibold">{top.c.name}</h3>
                  <p className="text-[15px] font-bold text-gold-dark">from {top.c.priceFrom}</p>
                </div>
                <p className="mt-2 text-[15px] text-ink/70">{top.c.why}</p>
                <ul className="mt-5 grid gap-2.5 text-[15px] sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <Car className="size-4 shrink-0 text-gold-dark" />
                    {top.mins} min to {w.short}
                    {top.metro && top.metro < top.mins ? `, ${top.metro} by metro` : ""}
                  </li>
                  {top.met.map(({ n, ok }) => (
                    <li key={n.id} className={`flex items-center gap-2 ${ok ? "" : "text-stone"}`}>
                      {ok ? <Check className="size-4 shrink-0 text-gold-dark" strokeWidth={3} /> : <X className="size-4 shrink-0" />}
                      {ok ? n.label : `${n.label}: not really`}
                    </li>
                  ))}
                  {!top.afford && <li className="text-stone">Homes here start above your budget</li>}
                </ul>
                <a
                  href={`/homes?community=${top.c.id}`}
                  className="mt-6 inline-block rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-ivory transition hover:bg-gold-dark"
                >
                  See homes in {short(top.c)}
                </a>
              </div>
            </article>

            {/* Everywhere else, ranked */}
            <p className={`mt-10 ${label}`}>THE REST, BEST FIRST</p>
            <ol className="mt-3 grid gap-2">
              {rest.map(({ c, mins, metro, met, afford }) => (
                <li key={c.id}>
                  <a
                    href={`/homes?community=${c.id}`}
                    className={`flex items-center gap-4 rounded-[20px] bg-white p-3 pr-5 transition hover:shadow-[0_20px_40px_-30px_rgb(40_28_16/0.6)] ${afford ? "" : "opacity-60"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                    <img src={photo(c.photo, 240)} alt="" className="h-16 w-20 shrink-0 rounded-xl bg-sand object-cover text-transparent" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[16px] font-semibold">{c.name}</span>
                        <span className="shrink-0 text-[13px] text-stone">from {c.priceFrom}</span>
                      </span>
                      <span className="mt-2.5 flex items-center gap-3">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand/70">
                          <span className="block h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${(mins / longest) * 100}%` }} />
                        </span>
                        <span className="w-[62px] shrink-0 text-right text-[14px] font-bold tabular-nums">{mins} min</span>
                      </span>
                      <span className="mt-1 block truncate text-[12.5px] text-stone">
                        {[
                          !afford && "Above your budget",
                          met.length > 0 && `${met.filter((x) => x.ok).length} of ${met.length} wishes`,
                          metro && `${metro} min by metro`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13px] leading-snug text-stone">
              Drive times are estimates from the map: about {rush ? "60% longer than off-peak, for the 8am rush" : "10am traffic"}. Metro times include the walk at each end.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
