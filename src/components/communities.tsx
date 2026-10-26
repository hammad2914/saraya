"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapLibreMap } from "maplibre-gl";
import { ArrowRight, Plane, TrainFront, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { communities, photo } from "@/content/communities";

const phone = () => window.innerWidth < 768;

/**
 * Where to buy: a real map of Dubai with a price pin on each community.
 * Tap a pin (or a name below the map on phones) to fly there and see what a
 * home costs and how far it is from the airport, the metro and the beach.
 */
export function Communities() {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [active, setActive] = useState("downtown");
  const activeRef = useRef(active);
  const c = communities.find((x) => x.id === active)!;

  const fly = (id: string) => {
    const at = communities.find((x) => x.id === id)!.at;
    // On desktop the panel covers the left of the map, so land the pin to its right.
    map.current?.flyTo({ center: at, zoom: phone() ? 10.9 : 12.2, speed: 0.8, offset: phone() ? [0, 0] : [170, 0] });
    document.querySelectorAll<HTMLElement>("[data-pin]").forEach((p) => (p.dataset.on = String(p.dataset.pin === id)));
  };

  useEffect(() => {
    let gone = false;
    import("maplibre-gl").then((maplibregl) => {
      if (gone || !box.current) return;
      // Turbopack can't bundle the worker, so it's served from public/ (copied on postinstall).
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const m = new maplibregl.Map({
        container: box.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [55.24, 25.13],
        zoom: phone() ? 9.6 : 10.6,
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      map.current = m;
      // Warm the grey basemap towards the site's sand and sea.
      m.on("style.load", () => {
        for (const l of m.getStyle().layers) {
          if (l.type === "background") m.setPaintProperty(l.id, "background-color", "#efe8dc");
          if (l.type === "fill" && l.id.includes("water")) m.setPaintProperty(l.id, "fill-color", "#c3d3d1");
        }
      });
      m.once("load", () => {
        fly(activeRef.current);
        // Keep the credits folded into the (i) button until asked for.
        box.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      });
      communities.forEach((x) => {
        const el = document.createElement("button");
        el.type = "button";
        el.dataset.pin = x.id;
        el.dataset.on = String(x.id === activeRef.current);
        el.setAttribute("aria-label", `${x.name}, from ${x.priceFrom}`);
        el.className =
          "group grid gap-px rounded-full bg-white px-3 py-1.5 text-left font-sans text-[12.5px] leading-tight font-semibold text-ink shadow-[0_10px_24px_-10px_rgb(40_28_16/0.55)] transition hover:-translate-y-0.5 data-[on=true]:z-10 data-[on=true]:bg-ink data-[on=true]:text-ivory";
        el.innerHTML = `<span>${x.name}</span><span class="font-medium text-stone group-data-[on=true]:text-gold">from ${x.priceFrom}</span>`;
        el.onclick = () => pick(x.id);
        new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(x.at).addTo(m);
      });
    });
    return () => {
      gone = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the map is built once
  }, []);

  function pick(id: string) {
    activeRef.current = id;
    setActive(id);
    fly(id);
  }

  return (
    <section id="communities" className="relative bg-ivory px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="font-display text-[clamp(40px,4.6vw,76px)] leading-[0.98] font-semibold tracking-[-0.02em]">Where to buy in Dubai</h2>
          <p className="max-w-[400px] text-[15.5px] leading-relaxed text-ink/70">
            Tap a pin to see what a home there costs, and how far it is from the airport, the metro and the beach.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[28px] bg-sand md:mt-10">
          {/* MapLibre sets position: relative on its container, so it needs a sized wrapper */}
          <div className="h-[420px] md:h-[660px]">
            <div ref={box} className="size-full" />
          </div>

          {/* Pins are small on a phone, so the names are here too */}
          <div className="flex gap-2 overflow-x-auto bg-white px-4 pt-4 [scrollbar-width:none] md:hidden">
            {communities.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => pick(x.id)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] font-semibold transition ${
                  x.id === active ? "bg-ink text-ivory" : "bg-sand text-ink/75"
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>

          <article
            key={c.id}
            className="animate-[rise_.5s_var(--ease-out-soft)] overflow-hidden bg-white md:absolute md:top-5 md:left-5 md:w-[350px] md:rounded-[22px] md:shadow-[0_30px_60px_-30px_rgb(40_28_16/0.6)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote listing photo */}
            <img src={photo(c.photo, 900)} alt={c.name} className="aspect-[16/9] w-full object-cover md:aspect-[16/10]" />
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[24px] leading-tight font-semibold">{c.name}</h3>
                <p className="shrink-0 text-[14px] font-bold text-gold-dark">from {c.priceFrom}</p>
              </div>
              <p className="mt-1 text-[14px] text-stone">{c.typicalHome}</p>
              <p className="mt-3 mb-4 text-[15px] leading-snug text-ink/75">{c.why}</p>
              <ul className="grid gap-2 text-[14px] text-stone">
                <li className="flex items-center gap-2"><Plane className="size-4 shrink-0" /> {c.toAirport}</li>
                <li className="flex items-center gap-2"><TrainFront className="size-4 shrink-0" /> {c.metro}</li>
                <li className="flex items-center gap-2"><Waves className="size-4 shrink-0" /> {c.beach}</li>
              </ul>
              <a href="#homes" data-community={c.id} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-ivory transition hover:bg-gold-dark">
                See homes here <ArrowRight className="size-4" />
              </a>
            </div>
          </article>
        </div>

        <p className="mt-4 text-[12.5px] text-stone">Prices and travel times are typical for 2026 and change with the market.</p>
      </div>
    </section>
  );
}
