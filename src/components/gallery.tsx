"use client";

import { ArrowLeft, ArrowRight, Images, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { photo } from "@/content/communities";
import type { Home } from "@/content/homes";

/**
 * A home's photos: one large and four small on a wide screen, a swipeable
 * strip on a phone. Any photo opens the full-screen viewer at that room.
 */
export function Gallery({ h }: { h: Home }) {
  const [at, setAt] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const n = h.photos.length;

  useEffect(() => {
    const d = dialog.current!;
    if (at !== null && !d.open) {
      d.showModal();
      closeBtn.current?.focus();
    }
    if (at === null && d.open) d.close();
  }, [at]);

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setAt((at + 1) % n);
      if (e.key === "ArrowLeft") setAt((at - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, n]);

  // Lazy, so the mosaic hidden on phones (and the strip hidden on wide screens) isn't downloaded.
  const tile = (k: number, className: string, w: number, lazy = true) => (
    <button key={h.photos[k].id} type="button" onClick={() => setAt(k)} className={`group overflow-hidden bg-sand ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
      <img
        src={photo(h.photos[k].id, w)}
        alt={`${h.name}: ${h.photos[k].room}`}
        loading={lazy ? "lazy" : undefined}
        className="absolute inset-0 size-full object-cover text-transparent transition duration-700 ease-out-soft group-hover:scale-[1.03]"
      />
    </button>
  );

  return (
    <>
      {/* Wide screens: a mosaic of the first five */}
      <div className="relative mt-8 hidden h-[min(600px,62svh)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[26px] md:grid">
        {tile(0, "relative col-span-2 row-span-2", 1600)}
        {h.photos.slice(1, 5).map((_, i) => tile(i + 1, "relative", 800))}
        <button
          type="button"
          onClick={() => setAt(0)}
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold shadow-lg transition hover:bg-ivory"
        >
          <Images className="size-4" /> All {n} photos
        </button>
      </div>

      {/* Phones: swipe through */}
      <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:hidden">
        {h.photos.map((p, k) => (
          <div key={p.id} className="relative aspect-[4/3] w-[86vw] shrink-0 snap-center overflow-hidden rounded-[20px]">
            {tile(k, "absolute inset-0", 900, k > 0)}
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-[12.5px] font-semibold text-white">
              {p.room} · {k + 1}/{n}
            </span>
          </div>
        ))}
      </div>

      <dialog
        ref={dialog}
        data-lenis-prevent
        onClose={() => setAt(null)}
        aria-label={`${h.name} photos`}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-ink text-ivory backdrop:bg-black/70"
      >
        <div className="flex h-full flex-col p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-semibold text-ivory/70">
              {at !== null && `${h.photos[at].room} · ${at + 1} of ${n}`}
            </p>
            <button ref={closeBtn} type="button" aria-label="Close photos" onClick={() => setAt(null)} className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <X className="size-5" />
            </button>
          </div>
          <div className="relative mt-4 min-h-0 flex-1">
            {h.photos.map((p, k) => (
              // eslint-disable-next-line @next/next/no-img-element -- remote photo
              <img
                key={p.id}
                src={photo(p.id, 2000)}
                alt={k === at ? `${h.name}: ${p.room}` : ""}
                loading="lazy"
                className={`absolute inset-0 size-full object-contain transition-opacity duration-500 ${k === at ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <button type="button" aria-label="Previous photo" onClick={() => setAt(((at ?? 0) - 1 + n) % n)} className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-white">
              <ArrowLeft className="size-5" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => setAt(((at ?? 0) + 1) % n)} className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-white">
              <ArrowRight className="size-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-2 overflow-x-auto [scrollbar-width:none]">
            {h.photos.map((p, k) => (
              <button
                key={p.id}
                type="button"
                aria-label={p.room}
                aria-pressed={k === at}
                onClick={() => setAt(k)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${k === at ? "opacity-100 ring-2 ring-gold" : "opacity-50 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                <img src={photo(p.id, 200)} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
