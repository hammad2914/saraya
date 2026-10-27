"use client";

import { useEffect, useRef, useState } from "react";

import { aed, aedShort } from "@/content/buying";

/** A number that glides to its new value instead of jumping. */
export function useGlide(target: number, ms = 600) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const now = a + (target - a) * (1 - (1 - k) ** 3);
      from.current = now;
      setV(now);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** An AED amount that glides. `short` gives "AED 2.4M"; `bare` drops the "AED ". */
export function Money({ value, className = "", short = false, bare = false }: { value: number; className?: string; short?: boolean; bare?: boolean }) {
  const v = useGlide(value);
  const t = short ? aedShort(v) : aed(v);
  return <span className={`tabular-nums ${className}`}>{bare ? t.replace("AED ", "") : t}</span>;
}
