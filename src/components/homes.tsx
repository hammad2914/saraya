"use client";

import { ArrowLeft, ArrowRight, Bath, BedDouble, CalendarClock, Ruler, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { photo } from "@/content/communities";
import { type Deal, dealLabels, type Home, homes, priceLabel } from "@/content/homes";

const ALL = "All areas";
/** The home page shows a few; the marketplace has the rest. */
const SHOWN = 4;

function Facts({ h, dark = false }: { h: Home; dark?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-1 text-[14px] ${dark ? "text-ivory/70" : "text-stone"}`}>
      <li className="flex items-center gap-1.5"><BedDouble className="size-4" /> {h.beds} beds</li>
      <li className="flex items-center gap-1.5"><Bath className="size-4" /> {h.baths} baths</li>
      <li className="flex items-center gap-1.5"><Ruler className="size-4" /> {h.sqft.toLocaleString("en-GB")} sq ft</li>
      {h.handover && <li className="flex items-center gap-1.5"><CalendarClock className="size-4" /> Keys {h.handover}</li>}
    </ul>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
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

/** One home in the list: photos you can flip through, the facts, and the two actions. */
function Row({ h, onOpen }: { h: Home; onOpen: () => void }) {
  const [i, setI] = useState(0);
  const n = h.photos.length;
  return (
    <article className="grid animate-[rise_.5s_var(--ease-out-soft)_both] overflow-hidden rounded-[26px] bg-white md:grid-cols-[1.35fr_1fr]">
      <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px]">
        <button type="button" onClick={onOpen} aria-label={`See inside ${h.name}`} className="absolute inset-0">
          {h.photos.map((p, k) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote photo
            <img
              key={p.id}
              src={photo(p.id, 1200)}
              alt={p.room}
              loading="lazy"
              className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </button>
        <p className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur">
          {h.photos[i].room} · {i + 1}/{n}
        </p>
        <div className="absolute right-4 bottom-4 flex gap-2">
          <button type="button" aria-label="Previous photo" onClick={() => setI((i - 1 + n) % n)} className="grid size-10 place-items-center rounded-full bg-white/90 transition hover:bg-white">
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next photo" onClick={() => setI((i + 1) % n)} className="grid size-10 place-items-center rounded-full bg-white/90 transition hover:bg-white">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col p-6 md:p-8">
        <p className="text-[13px] font-bold tracking-[0.2em] text-gold-dark">
          {h.kind.toUpperCase()} · {h.area.toUpperCase()}
        </p>
        <h3 className="mt-2 font-display text-[28px] leading-tight font-semibold md:text-[30px]">{h.name}</h3>
        <p className="mt-3 text-[15.5px] text-ink/75">{h.hook}</p>
        <div className="mt-5">
          <Facts h={h} />
        </div>
        <p className="mt-6 font-display text-[28px] font-semibold md:mt-auto md:pt-8 md:text-[30px]">{priceLabel(h)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onOpen} className="rounded-full border border-ink/15 px-5 py-3 text-[14px] font-bold transition hover:border-ink">
            See inside
          </button>
          <a href="#viewing" data-book={h.id} className="rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-ivory transition hover:bg-gold-dark">
            Book a viewing
          </a>
          <a href={`/homes/${h.id}`} className="flex items-center gap-1.5 px-3 py-3 text-[14px] font-bold text-gold-dark transition hover:text-ink">
            Full details <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

/** A home opened up: large, room by room, with the next home one click away. */
function Inside({ list, id, setId, onClose }: { list: Home[]; id: string | null; setId: (id: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  // The room shown belongs to one home; opening another starts at its first photo.
  const [seen, setSeen] = useState<[string | null, number]>([null, 0]);
  const room = seen[0] === id ? seen[1] : 0;
  const setRoom = (n: number) => setSeen([id, n]);
  const k = list.findIndex((x) => x.id === id);
  const h = list[k];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (id && !d.open) {
      d.showModal();
      closeBtn.current?.focus(); // not the first photo chip the browser would pick
    }
    if (!id && d.open) d.close();
  }, [id]);

  const go = (step: number) => setId(list[(k + step + list.length) % list.length].id);

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={h ? h.name : "Home"}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-ink text-ivory backdrop:bg-black/60 md:m-auto md:h-[min(860px,92dvh)] md:w-[min(1320px,94vw)] md:rounded-[28px]"
    >
      <button
        ref={closeBtn}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 grid size-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70 md:top-7 md:right-7 md:bg-white/10 md:hover:bg-white/20"
      >
        <X className="size-5" />
      </button>
      {h && (
        <div key={h.id} className="grid min-h-full animate-[fade_.4s_ease-out] gap-6 p-4 md:grid-cols-[1.6fr_1fr] md:gap-8 md:p-8">
          <div className="flex min-w-0 flex-col">
            <div className="relative min-h-[46vh] flex-1 overflow-hidden rounded-[22px] md:min-h-0">
              {h.photos.map((p, n) => (
                // eslint-disable-next-line @next/next/no-img-element -- remote photo
                <img
                  key={p.id}
                  src={photo(p.id, 1800)}
                  alt={p.room}
                  className={`absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 ease-out-soft ${n === room ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
                />
              ))}
            </div>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
              {h.photos.map((p, n) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={n === room}
                  onClick={() => setRoom(n)}
                  className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 text-[14px] font-semibold transition ${n === room ? "bg-ivory text-ink" : "bg-white/10 text-ivory/70 hover:text-ivory"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                  <img src={photo(p.id, 120)} alt="" className="size-8 rounded-full object-cover" />
                  {p.room}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col pb-4 md:pb-0">
            <p className="text-[13px] font-bold tracking-[0.2em] text-gold md:pr-14">
              {dealLabels[h.deal].toUpperCase()} · {h.area.toUpperCase()}
            </p>
            <h3 className="mt-3 font-display text-[clamp(32px,3vw,44px)] leading-[1.02] font-semibold">{h.name}</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-ivory/75">{h.hook}</p>
            <div className="mt-6">
              <Facts h={h} dark />
            </div>
            <p className="mt-8 font-display text-[clamp(32px,3vw,44px)] font-semibold">{priceLabel(h)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a href="#viewing" data-book={h.id} onClick={onClose} className="rounded-full bg-gold px-6 py-3.5 text-[15px] font-bold text-ink transition hover:bg-ivory">
                Book a viewing
              </a>
              <a href={`/homes/${h.id}`} className="flex items-center gap-1.5 px-4 py-3.5 text-[15px] font-bold text-ivory/80 transition hover:text-ivory">
                Full details <ArrowRight className="size-4" />
              </a>
            </div>
            {list.length > 1 && (
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-6 max-md:mt-10">
                <button type="button" onClick={() => go(-1)} className="flex items-center gap-2 text-[14px] font-semibold text-ivory/70 transition hover:text-ivory">
                  <ArrowLeft className="size-4" /> Previous home
                </button>
                <span className="text-[13px] text-ivory/45">
                  {k + 1} of {list.length}
                </span>
                <button type="button" onClick={() => go(1)} className="flex items-center gap-2 text-[14px] font-semibold text-ivory/70 transition hover:text-ivory">
                  Next home <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

/**
 * Homes on the market: Buy, Rent or Off-plan, narrowed by area and bedrooms.
 * Open any home to walk through it room by room.
 */
export function Homes() {
  const [deal, setDeal] = useState<Deal>("buy");
  const [area, setArea] = useState(ALL);
  const [beds, setBeds] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const pool = homes.filter((h) => h.deal === deal);
  const areas = [ALL, ...new Set(pool.map((h) => h.area))];
  const list = pool.filter((h) => (area === ALL || h.area === area) && h.beds >= beds);
  const shown = list.slice(0, SHOWN);
  // The same view in the marketplace, with every match.
  const community = area === ALL ? null : pool.find((h) => h.area === area)!.community;
  const more = `/homes?deal=${deal}${community ? `&community=${community}` : ""}${beds ? `&beds=${beds}` : ""}`;

  return (
    <section id="homes" className="scroll-mt-16 bg-[#f4eee5] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">Homes on the market</h2>
          <div className="inline-flex rounded-full bg-white p-1" role="group" aria-label="Buy, rent or off-plan">
            {(Object.keys(dealLabels) as Deal[]).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={d === deal}
                onClick={() => {
                  setDeal(d);
                  setArea(ALL);
                }}
                className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${d === deal ? "bg-ink text-ivory" : "text-ink/70 hover:text-ink"}`}
              >
                {dealLabels[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="-mx-5 mt-8 flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {areas.map((a) => (
            <Pill key={a} on={a === area} onClick={() => setArea(a)}>
              {a}
            </Pill>
          ))}
        </div>
        <div className="-mx-5 mt-2 flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          {[0, 2, 3, 4, 5].map((b) => (
            <Pill key={b} on={b === beds} onClick={() => setBeds(b)}>
              {b ? `${b}+ beds` : "Any beds"}
            </Pill>
          ))}
        </div>

        <p className="mt-6 text-[14px] text-stone">
          {list.length} {list.length === 1 ? "home" : "homes"}
          {deal === "rent" ? ", yearly rent" : deal === "offplan" ? ", still being built" : " for sale"}
        </p>
        <div key={deal + area + beds} className="mt-3 grid gap-5">
          {shown.map((h) => (
            <Row key={h.id} h={h} onOpen={() => setOpen(h.id)} />
          ))}
          {!list.length && (
            <div className="rounded-[26px] bg-white p-10 text-center">
              <p className="text-[16px] text-stone">Nothing with {beds}+ bedrooms here yet.</p>
              <button type="button" onClick={() => setBeds(0)} className="mt-4 rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-ivory">
                Show any size
              </button>
            </div>
          )}
        </div>
        {list.length > SHOWN && (
          <a href={more} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-[15px] font-bold text-ivory transition hover:bg-gold-dark">
            See all {list.length} homes, with the map <ArrowRight className="size-4" />
          </a>
        )}
        <p className="mt-4 text-[12.5px] text-stone">Listings in this concept are examples. Photos from Unsplash.</p>
      </div>
      <Inside list={shown} id={open} setId={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
