"use client";

import { Plane } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Money } from "@/components/money";
import { remoteSteps, residency, residencyFor } from "@/content/abroad";
import { aedShort, presets } from "@/content/buying";
import { homes } from "@/content/homes";
import { cities, hourIn, slots, timeIn } from "@/content/viewing";

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

/** A fixed day, so the server and the browser agree on every clock. */
const SAMPLE_DAY = Date.UTC(2026, 10, 10);
const dubaiAt = (h: number) => new Date(SAMPLE_DAY + (h - 4) * 3_600_000);
/** The first Dubai slot that falls in working hours where the buyer lives. */
const callHour = (tz: string) => slots.find((h) => hourIn(dubaiAt(h), tz) >= 9 && hourIn(dubaiAt(h), tz) <= 19) ?? 11;
/** Steps that happen at a set time: the viewing, reserving, and transfer day. */
const timed = new Set([0, 1, 3]);

const goldenHomes = homes.filter((h) => h.deal !== "rent" && h.price >= residency[2].from).length;

/**
 * For buyers who don't live in Dubai yet: the residency a home's price brings,
 * then how to buy it without flying in, with times on the buyer's own clock.
 */
export function Abroad() {
  const [price, setPrice] = useState(1_800_000);
  const [city, setCity] = useState(cities[0]);
  const r = residencyFor(price);
  const h = callHour(city.tz);

  useEffect(() => {
    const here = cities.find((c) => c.tz === Intl.DateTimeFormat().resolvedOptions().timeZone);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on the viewer's clock
    if (here) setCity(here);
  }, []);

  return (
    <section id="from-abroad" className="scroll-mt-16 bg-[#f4eee5] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">Buying from abroad</h2>
          <p className="max-w-[440px] text-[15.5px] leading-relaxed text-ink/70">
            Most people who buy in Dubai don&apos;t live here yet. A home can bring residency with it, and you can buy it without getting on a plane.
          </p>
        </div>

        {/* What the home gets you */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start lg:gap-14">
          <div>
            <h3 className="font-display text-[clamp(28px,2.6vw,40px)] leading-tight font-semibold">What your home gets you</h3>
            <label className="mt-8 block">
              <span className={label}>PRICE OF THE HOME</span>
              <Money value={price} className="mt-2 block font-display text-[clamp(36px,5vw,52px)] leading-none font-semibold" />
              <input
                type="range"
                min={500_000}
                max={20_000_000}
                step={50_000}
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                aria-label="Price of the home"
                className="mt-5 w-full accent-[#8f6f3f]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              {presets.map((p) => (
                <Chip key={p.label} on={p.price === price} onClick={() => setPrice(p.price)}>
                  {p.label} · {aedShort(p.price)}
                </Chip>
              ))}
            </div>
            <p className="mt-8 text-[15px] leading-relaxed text-ink/70">
              {goldenHomes} of the homes for sale on Saraya come with a Golden Visa.{" "}
              <Link href="/homes?deal=buy" className="font-semibold text-ink underline decoration-gold underline-offset-4">
                See homes for sale
              </Link>
            </p>
          </div>

          <ol className="grid gap-2">
            {[...residency].reverse().map((x) => {
              const on = x.id === r.id;
              const reached = price >= x.from;
              return (
                <li key={x.id} className={`rounded-[22px] p-5 transition duration-500 md:p-6 ${on ? "bg-ink text-ivory" : "bg-white"} ${reached ? "" : "opacity-55"}`}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-[26px] leading-tight font-semibold">{x.title}</p>
                    <p className={`shrink-0 text-[13px] font-bold ${on ? "text-gold" : "text-stone"}`}>{x.from ? `from ${aedShort(x.from)}` : "any price"}</p>
                  </div>
                  <p className={`mt-1 text-[15px] ${on ? "text-ivory/80" : "text-ink/70"}`}>
                    {x.years}
                    {x.family && ` · ${x.family}`}
                  </p>
                  {on && <p className="mt-3 animate-[fade_.4s_ease-out] text-[14px] text-ivory/70">{x.note}</p>}
                  {!reached && <p className="mt-2 text-[13.5px] text-stone">{aedShort(x.from - price)} more would get you this.</p>}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Without flying in */}
        <div className="mt-20 md:mt-28">
          <h3 className="font-display text-[clamp(28px,2.6vw,40px)] leading-tight font-semibold">Buy it without flying in</h3>
          <p className={`mt-6 ${label}`}>WHERE DO YOU LIVE</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((x) => (
              <Chip key={x.name} on={x.name === city.name} onClick={() => setCity(x)}>
                {x.name}
              </Chip>
            ))}
          </div>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {remoteSteps.map((s, i) => {
              const away = s.where !== "Your first trip";
              return (
                <li key={s.title} className={`flex flex-col rounded-[22px] p-5 ${away ? "bg-white" : "bg-ink text-ivory"}`}>
                  <span className={`grid size-8 place-items-center rounded-full text-[14px] font-bold ${away ? "bg-sand" : "bg-gold text-ink"}`}>{i + 1}</span>
                  <p className="mt-4 font-display text-[22px] leading-tight font-semibold">{s.title}</p>
                  <p className={`mt-2 flex-1 text-[14px] leading-snug ${away ? "text-ink/70" : "text-ivory/75"}`}>{s.body}</p>
                  <p className={`mt-4 text-[12.5px] font-bold tracking-[0.12em] ${away ? "text-gold-dark" : "text-gold"}`}>{s.where.toUpperCase()}</p>
                  {timed.has(i) && (
                    <p className="mt-1 text-[13px] text-stone">
                      {h}:00 Dubai is <b className="text-ink">{timeIn(dubaiAt(h), city.tz)}</b> in {city.name}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-5 flex items-center gap-3 rounded-[22px] bg-sand/70 px-6 py-4 text-[16px]">
            <Plane className="size-5 shrink-0 text-gold-dark" />
            <span>
              Trips to Dubai before the home is yours: <b>none</b>.
            </span>
          </p>
          <p className="mt-4 text-[13px] text-stone">
            Rules as commonly quoted for 2026. They change, so confirm with the Land Department, ICP and your bank before you pay.
          </p>
        </div>
      </div>
    </section>
  );
}
