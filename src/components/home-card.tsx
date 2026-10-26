"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { photo } from "@/content/communities";
import { type Home, priceLabel } from "@/content/homes";

/** Badge on the photo: off-plan handover, or how recently it was listed. */
function badge(h: Home) {
  if (h.deal === "offplan") return `Keys ${h.handover}`;
  if (h.listed <= 7) return h.listed <= 1 ? "New today" : `New, ${h.listed} days ago`;
  return null;
}

/** A home in a list: flip through its photos, tap anywhere else to open it. */
export function HomeCard({ h, onHover }: { h: Home; onHover?: (id: string | null) => void }) {
  const [i, setI] = useState(0);
  const n = h.photos.length;
  const b = badge(h);
  return (
    <article
      onMouseEnter={() => onHover?.(h.id)}
      onMouseLeave={() => onHover?.(null)}
      className="group relative animate-[rise_.5s_var(--ease-out-soft)_both] overflow-hidden rounded-[22px] bg-white transition-shadow duration-300 hover:shadow-[0_30px_60px_-36px_rgb(40_28_16/0.7)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {h.photos.map((p, k) => (
          // eslint-disable-next-line @next/next/no-img-element -- remote photo
          <img
            key={p.id}
            src={photo(p.id, 800)}
            alt={k === i ? `${h.name}: ${p.room}` : ""}
            loading={k === 0 ? undefined : "lazy"}
            className={`absolute inset-0 size-full object-cover text-transparent transition-[opacity,scale] duration-500 ${k === i ? "opacity-100" : "opacity-0"} group-hover:scale-[1.03]`}
          />
        ))}
        {b && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-bold text-ink">{b}</span>
        )}
        {/* Photo position, as small bars */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1">
          {h.photos.map((p, k) => (
            <span key={p.id} className={`h-[3px] rounded-full bg-white transition-all ${k === i ? "w-4" : "w-1.5 opacity-60"}`} />
          ))}
        </div>
        <div className="absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 justify-between opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <button type="button" aria-label="Previous photo" onClick={() => setI((i - 1 + n) % n)} className="grid size-9 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white">
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next photo" onClick={() => setI((i + 1) % n)} className="grid size-9 place-items-center rounded-full bg-white/90 shadow transition hover:bg-white">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="p-4 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-[23px] leading-tight font-semibold">{priceLabel(h)}</p>
          <p className="shrink-0 text-[12px] font-bold tracking-[0.14em] text-gold-dark">{h.kind.toUpperCase()}</p>
        </div>
        <h3 className="mt-1 text-[15.5px] font-semibold">
          {/* The whole card opens the home; the photo arrows sit above this link */}
          <Link href={`/homes/${h.id}`} className="after:absolute after:inset-0">
            {h.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[14px] text-stone">{h.area}</p>
        <p className="mt-3 flex gap-4 border-t border-ink/10 pt-3 text-[13.5px] text-ink/70">
          <span>{h.beds} beds</span>
          <span>{h.baths} baths</span>
          <span>{h.sqft.toLocaleString("en-GB")} sq ft</span>
        </p>
      </div>
    </article>
  );
}
