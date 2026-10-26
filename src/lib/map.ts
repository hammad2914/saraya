import { photo } from "@/content/communities";
import { type Home, priceLabel, priceShort } from "@/content/homes";

export type MapLib = typeof import("maplibre-gl");

/**
 * A MapLibre map in the site's colours, with zoom buttons. Callers must import
 * "maplibre-gl/dist/maplibre-gl.css" (markers are invisible without it).
 * Resolves to null if `cancelled()` turns true while the library loads: two maps
 * built in one container break each other when the first is removed.
 */
export async function makeMap(container: HTMLElement, opts: { center: [number, number]; zoom: number; cooperative?: boolean; cancelled: () => boolean }) {
  const lib = await import("maplibre-gl");
  if (opts.cancelled()) return null;
  // Turbopack can't bundle the worker, so it's served from public/ (copied on postinstall).
  lib.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
  const m = new lib.Map({
    container,
    style: "https://tiles.openfreemap.org/styles/positron",
    center: opts.center,
    zoom: opts.zoom,
    attributionControl: { compact: true },
    cooperativeGestures: opts.cooperative ?? true,
  });
  m.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
  // Warm the grey basemap towards the site's sand and sea.
  m.on("style.load", () => {
    for (const l of m.getStyle().layers) {
      if (l.type === "background") m.setPaintProperty(l.id, "background-color", "#efe8dc");
      if (l.type === "fill" && l.id.includes("water")) m.setPaintProperty(l.id, "fill-color", "#c3d3d1");
    }
  });
  // Keep the credits folded into the (i) button until asked for.
  m.once("load", () => container.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show"));
  return { lib, m };
}

/**
 * A price pin for one home. The marker is a plain wrapper, so the map can move
 * it while the button inside is free to fade and scale.
 * `near` hides the pin until the map is zoomed in (used on the overview map).
 */
export function homePin(h: Home, { near = false } = {}) {
  const wrap = document.createElement("div");
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.homePin = h.id;
  b.setAttribute("aria-label", `${h.name}, ${priceLabel(h)}`);
  b.className = [
    "rounded-full bg-white px-2.5 py-1 font-sans text-[12.5px] font-bold whitespace-nowrap text-ink shadow-[0_8px_18px_-8px_rgb(40_28_16/0.6)]",
    "transition duration-200 hover:scale-110 data-[on=true]:scale-110 data-[on=true]:bg-ink data-[on=true]:text-ivory",
    near ? "group-data-[near=false]/map:pointer-events-none group-data-[near=false]/map:scale-50 group-data-[near=false]/map:opacity-0" : "",
  ].join(" ");
  b.innerHTML = `${h.deal === "offplan" ? '<span class="mr-1 inline-block size-1.5 -translate-y-px rounded-full bg-gold align-middle"></span>' : ""}${priceShort(h.price)}${h.deal === "rent" ? "<span class=\"font-semibold opacity-60\">/yr</span>" : ""}`;
  wrap.append(b);
  return { wrap, button: b };
}

/**
 * Pins that would overlap on screen are swapped for one "4 homes" bubble,
 * which zooms in on them when tapped. Re-run after every move and whenever the
 * pins change. `near` matches homePin's option: bubbles hide while zoomed out.
 */
export function declutter(lib: MapLib, m: import("maplibre-gl").Map, pins: () => Iterable<import("maplibre-gl").Marker>, { near = false } = {}) {
  let bubbles: import("maplibre-gl").Marker[] = [];
  const run = () => {
    bubbles.forEach((b) => b.remove());
    bubbles = [];
    const pts = [...pins()].map((mk) => ({ mk, p: m.project(mk.getLngLat()) }));
    const taken = new Set<(typeof pts)[number]>();
    for (const a of pts) {
      if (taken.has(a)) continue;
      // A pin is about 54 x 26 px; anything closer than that would overlap it.
      const group = pts.filter((b) => !taken.has(b) && Math.abs(b.p.x - a.p.x) < 54 && Math.abs(b.p.y - a.p.y) < 26);
      group.forEach((b) => taken.add(b));
      group.forEach((b) => (b.mk.getElement().style.visibility = group.length > 1 ? "hidden" : ""));
      if (group.length < 2) continue;
      const bounds = new lib.LngLatBounds();
      group.forEach((b) => bounds.extend(b.mk.getLngLat()));
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = [
        "rounded-full bg-ink px-3 py-1 font-sans text-[12.5px] font-bold whitespace-nowrap text-ivory shadow-[0_8px_18px_-8px_rgb(40_28_16/0.7)] transition hover:scale-110",
        near ? "group-data-[near=false]/map:pointer-events-none group-data-[near=false]/map:opacity-0" : "",
      ].join(" ");
      btn.textContent = `${group.length} homes`;
      btn.setAttribute("aria-label", `${group.length} homes here, zoom in`);
      btn.onclick = (e) => {
        e.stopPropagation();
        m.fitBounds(bounds, { padding: 90, maxZoom: Math.max(m.getZoom() + 2, 14), duration: 800 });
      };
      const wrap = document.createElement("div");
      wrap.append(btn);
      // Placed on the pin the group grew from, which nothing else overlaps.
      bubbles.push(new lib.Marker({ element: wrap, anchor: "bottom" }).setLngLat(a.mk.getLngLat()).addTo(m));
    }
  };
  m.on("moveend", run);
  return run;
}

/** The small card that opens above a pin. */
export function homeCard(h: Home) {
  const a = document.createElement("a");
  a.href = `/homes/${h.id}`;
  a.className = "block w-[240px] overflow-hidden rounded-[16px] bg-white font-sans text-ink no-underline outline-none focus-visible:ring-2 focus-visible:ring-gold";
  a.innerHTML = `
    <img src="${photo(h.photos[0].id, 500)}" alt="" class="aspect-[16/10] w-full object-cover" />
    <span class="block px-3.5 pt-3 pb-3.5">
      <span class="block text-[11.5px] font-bold tracking-[0.16em] text-gold-dark">${h.kind.toUpperCase()} · ${h.area.toUpperCase()}</span>
      <span class="mt-1 block text-[15.5px] leading-snug font-semibold">${h.name}</span>
      <span class="mt-1 flex items-center justify-between gap-2">
        <span class="text-[13px] text-stone">${h.beds} beds · ${h.sqft.toLocaleString("en-GB")} sq ft</span>
        <span class="text-[14px] font-bold">${priceShort(h.price)}${h.deal === "rent" ? "/yr" : ""}</span>
      </span>
    </span>`;
  return a;
}
