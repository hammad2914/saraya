"use client";

import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Money } from "@/components/money";
import { aed } from "@/content/buying";
import { communities, photo } from "@/content/communities";
import { kinds } from "@/content/homes";
import { estimate, lettingCosts, type Owned, sellingCosts, sizes } from "@/content/selling";
import { agents, nextDays } from "@/content/viewing";

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

/** "Dubai Hills Estate" → "Hills": short enough for a chip, and what the agents' areas use. */
const short = (name: string) => name.replace(/^Dubai /, "").replace(/ (Estate|Dubai)$/, "");

type Line = { label: string; note: string; amount: number };

/** One side of "sell or let": the money in, what comes off, what's left. */
function Receipt({ title, gross, grossLabel, lines, kept, keptLabel }: { title: string; gross: number; grossLabel: string; lines: Line[]; kept: number; keptLabel: string }) {
  return (
    <div className="flex flex-col rounded-[26px] bg-white p-6 md:p-7">
      <p className="font-display text-[30px] font-semibold">{title}</p>
      <p className="mt-4 flex items-baseline justify-between gap-4 text-[15px]">
        <span className="text-ink/70">{grossLabel}</span>
        <Money value={gross} className="font-bold" />
      </p>
      <ul className="mt-3 grid gap-3 border-y border-ink/8 py-4">
        {lines.map((l) => (
          <li key={l.label} className="flex items-baseline justify-between gap-4 text-[14.5px]">
            <span>
              <span className="block">{l.label}</span>
              <span className="block text-[12.5px] text-stone">{l.note}</span>
            </span>
            <span className="shrink-0 text-ink/70">
              − <Money value={l.amount} />
            </span>
          </li>
        ))}
      </ul>
      <p className={`mt-auto pt-5 ${label}`}>{keptLabel}</p>
      <Money value={kept} className="mt-1 font-display text-[clamp(32px,8vw,38px)] leading-none font-semibold" />
    </div>
  );
}

/**
 * For owners: what a home here might sell or let for, worked out from the
 * homes listed on this site, then both options side by side after every fee.
 */
export function Selling() {
  const [o, setO] = useState<Owned>({ community: "marina", kind: "Apartment", beds: 2, sqft: 1250 });
  const [why, setWhy] = useState(false);
  // The valuation visit: closed, then choosing a day, then asked for.
  const [visit, setVisit] = useState<"closed" | "day" | "asked">("closed");
  const [days, setDays] = useState<Date[]>([]);
  const [day, setDay] = useState(0);

  const set = (p: Partial<Owned>) => {
    setO((prev) => {
      const n = { ...prev, ...p };
      const [lo, hi] = sizes[n.kind];
      n.sqft = Math.min(hi, Math.max(lo, n.sqft));
      return n;
    });
    if (visit === "asked") setVisit("day");
  };

  const c = communities.find((x) => x.id === o.community)!;
  const e = estimate(o);
  const sell = sellingCosts(e.mid);
  const kept = e.mid - sell.reduce((s, l) => s + l.amount, 0);
  const let_ = lettingCosts(o, e.rent);
  const net = e.rent - let_.reduce((s, l) => s + l.amount, 0);
  const agent = agents.find((a) => a.areas.includes(short(c.name).split(" ")[0])) ?? agents[0];
  const first = agent.name.split(" ")[0];
  const [lo, hi] = sizes[o.kind];
  const home = `${o.beds}-bed ${o.kind.toLowerCase()} in ${c.name}`;
  const dayLabel = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <section id="selling" className="scroll-mt-16 bg-ivory px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-14">
          <div>
            <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">What is your home worth?</h2>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-ink/70">
              Already own in Dubai? Tell us four things and see a price range, worked out from the homes for sale near yours.
            </p>

            <div className="mt-10 grid gap-6">
              <div>
                <p className={label}>WHERE IS IT</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {communities.map((x) => (
                    <Chip key={x.id} on={o.community === x.id} onClick={() => set({ community: x.id })}>
                      {short(x.name)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className={label}>WHAT IS IT</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <Chip key={k} on={o.kind === k} onClick={() => set({ kind: k })}>
                      {k}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className={label}>BEDROOMS</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((b) => (
                    <Chip key={b} on={o.beds === b} onClick={() => set({ beds: b })}>
                      {b}
                    </Chip>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className={label}>
                  SIZE · <span className="text-ink">{o.sqft.toLocaleString("en-GB")} SQ FT</span>
                </span>
                <input
                  type="range"
                  min={lo}
                  max={hi}
                  step={50}
                  value={o.sqft}
                  onChange={(ev) => set({ sqft: +ev.target.value })}
                  aria-label="Size in square feet"
                  className="mt-4 w-full accent-[#8f6f3f]"
                />
              </label>
            </div>
          </div>

          {/* The estimate */}
          <div className="rounded-[26px] bg-white p-6 shadow-[0_40px_80px_-50px_rgb(40_28_16/0.6)] md:p-7 lg:sticky lg:top-28">
            <p className={label}>LIKELY TO SELL FOR</p>
            <p className="mt-3 font-display text-[clamp(32px,9vw,44px)] leading-none font-semibold whitespace-nowrap">
              <Money value={e.low} short /> <span className="text-stone">–</span> <Money value={e.high} short bare />
            </p>
            <p className="mt-3 text-[15px] text-ink/70">
              Most likely around <Money value={e.mid} className="font-bold text-ink" />
            </p>
            <p className="mt-5 rounded-2xl bg-sand/60 p-4 text-[15px]">
              Or let it for about <Money value={e.rent} className="font-bold" /> a year.
            </p>

            <button
              type="button"
              aria-expanded={why}
              onClick={() => setWhy(!why)}
              className="mt-5 flex w-full items-center justify-between gap-3 text-left text-[13.5px] leading-snug text-stone transition hover:text-ink"
            >
              <span>
                Based on {e.comps.length} homes for sale in {c.name}, asking a median of {aed(e.ppsf)} per sq ft.
              </span>
              <ChevronDown className={`size-4 shrink-0 transition-transform duration-300 ${why ? "rotate-180" : ""}`} />
            </button>
            {why && (
              <ul className="mt-2 animate-[fade_.3s_ease-out] divide-y divide-ink/8">
                {e.comps.map((h) => (
                  <li key={h.id}>
                    <a href={`/homes/${h.id}`} className="flex items-center gap-3 py-2.5 transition hover:opacity-70">
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                      <img src={photo(h.photos[0].id, 120)} alt="" className="h-9 w-12 shrink-0 rounded-md bg-sand object-cover text-transparent" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{h.name}</span>
                        <span className="block text-[12.5px] text-stone">{h.sqft.toLocaleString("en-GB")} sq ft</span>
                      </span>
                      <span className="text-[13px] text-ink/70 tabular-nums">{aed(h.price / h.sqft)}/sq ft</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {visit === "closed" ? (
              <button
                type="button"
                onClick={() => {
                  setDays(nextDays(5));
                  setVisit("day");
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-[15px] font-bold text-ivory transition hover:bg-gold-dark"
              >
                Book a free valuation visit <ArrowRight className="size-4" />
              </button>
            ) : (
              <div className="mt-6 animate-[fade_.35s_ease-out] rounded-2xl bg-sand/60 p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                  <img src={photo(agent.photo, 120)} alt="" className="size-11 rounded-xl bg-sand object-cover object-top text-transparent" />
                  <p className="text-[14px] leading-snug">
                    <b>{agent.name}</b> values homes in {c.name}. Which day suits you?
                  </p>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Day of the visit">
                  {days.map((d, i) => (
                    <Chip key={i} on={day === i} onClick={() => (setDay(i), setVisit("day"))}>
                      {dayLabel(d)}
                    </Chip>
                  ))}
                </div>
                {visit === "asked" ? (
                  <p className="mt-4 flex items-start gap-2 text-[14px]">
                    <Check className="mt-0.5 size-5 shrink-0 text-gold-dark" /> Request sent. {first} will confirm a time on WhatsApp for {dayLabel(days[day])}.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisit("asked")}
                    className="mt-4 w-full rounded-full bg-ink py-3.5 text-[15px] font-bold text-ivory transition hover:bg-gold-dark"
                  >
                    Ask {first} to value my {o.beds}-bed
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sell or let */}
        <div className="mt-20 md:mt-28">
          <h3 className="font-display text-[clamp(32px,3.2vw,52px)] leading-[1] font-semibold tracking-[-0.02em]">Sell it, or let it?</h3>
          <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-ink/70">The same {home}, both ways, after every fee.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Receipt title="Sell it" gross={e.mid} grossLabel="Likely sale price" lines={sell} kept={kept} keptLabel="YOU KEEP, ONCE" />
            <Receipt title="Let it" gross={e.rent} grossLabel="Likely rent, a year" lines={let_} kept={net} keptLabel="YOU KEEP, EVERY YEAR" />
          </div>
          <p className="mt-5 rounded-[22px] bg-ink px-6 py-5 text-[16px] leading-relaxed text-ivory md:text-[17px]">
            Letting it brings in <b className="text-gold">{((net / e.mid) * 100).toFixed(1)}%</b> of its value a year. It would take about{" "}
            <b className="text-gold">{Math.round(kept / net)} years</b> of rent to match selling today.
          </p>
          <p className="mt-4 text-[13px] text-stone">Estimates from asking prices on this site. A valuation visit sets the real price.</p>
        </div>
      </div>
    </section>
  );
}
