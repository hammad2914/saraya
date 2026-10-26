"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import type { Home } from "@/content/homes";
import { declutter, homeCard, homePin, type MapLib, makeMap } from "@/lib/map";

/**
 * A map with a price pin for each home in `list`. Tap a pin for a small card
 * that links to the home. `hot` lights up one pin (the card under the mouse).
 * The map frames the list whenever it changes, so filtering re-centres it.
 */
export function HomesMap({
  list,
  hot = null,
  cooperative = true,
  maxZoom = 13.5,
  className = "",
}: {
  list: Home[];
  hot?: string | null;
  cooperative?: boolean;
  maxZoom?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const live = useRef<{ lib: MapLib; m: MapLibreMap; pins: Map<string, Marker>; popup: Popup | null; tidy: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const framed = useRef(false);

  useEffect(() => {
    let gone = false;
    makeMap(box.current!, { center: [55.24, 25.13], zoom: 10.4, cooperative, cancelled: () => gone }).then((made) => {
      if (!made) return;
      const { lib, m } = made;
      const pins = new Map<string, Marker>();
      live.current = { lib, m, pins, popup: null, tidy: declutter(lib, m, () => pins.values()) };
      m.once("load", () => setReady(true));
    });
    return () => {
      gone = true;
      live.current?.m.remove();
      live.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the map is built once
  }, []);

  // Pins follow the list: drop the ones filtered out, add the new ones, then frame them.
  useEffect(() => {
    const s = live.current;
    if (!ready || !s) return;
    const ids = new Set(list.map((h) => h.id));
    for (const [id, mk] of s.pins) {
      if (ids.has(id)) continue;
      mk.remove();
      s.pins.delete(id);
    }
    s.popup?.remove();
    for (const h of list) {
      if (s.pins.has(h.id)) continue;
      const { wrap, button } = homePin(h);
      button.onclick = (e) => {
        e.stopPropagation();
        s.popup?.remove();
        s.popup = new s.lib.Popup({ closeButton: false, offset: 18, maxWidth: "none", className: "saraya-popup", focusAfterOpen: false })
          .setLngLat(h.at)
          .setDOMContent(homeCard(h))
          .addTo(s.m);
      };
      s.pins.set(h.id, new s.lib.Marker({ element: wrap, anchor: "bottom" }).setLngLat(h.at).addTo(s.m));
    }
    s.tidy();
    if (!list.length) return;
    const b = new s.lib.LngLatBounds();
    list.forEach((h) => b.extend(h.at));
    const frame = (duration: number) => s.m.fitBounds(b, { padding: { top: 70, bottom: 40, left: 50, right: 70 }, maxZoom, duration });
    frame(framed.current ? 900 : 0);
    framed.current = true;
    // A map that starts hidden (the phone's list view) has no size to frame with,
    // so frame again the first time it's shown.
    let wasHidden = box.current!.clientWidth === 0;
    const ro = new ResizeObserver(() => {
      const hidden = box.current!.clientWidth === 0;
      if (wasHidden && !hidden) {
        s.m.resize();
        frame(0);
      }
      wasHidden = hidden;
    });
    ro.observe(box.current!);
    return () => ro.disconnect();
  }, [ready, list, maxZoom]);

  useEffect(() => {
    live.current?.pins.forEach((mk, id) => {
      const el = mk.getElement();
      el.style.zIndex = id === hot ? "5" : "";
      (el.firstElementChild as HTMLElement).dataset.on = String(id === hot);
    });
  }, [hot, ready, list]);

  return (
    // MapLibre sets position: relative on its container, so it needs a sized wrapper
    <div className={className} data-lenis-prevent>
      <div ref={box} className="size-full" />
    </div>
  );
}
