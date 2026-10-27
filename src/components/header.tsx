"use client";

import { useEffect, useRef, useState } from "react";

import { communities, photo } from "@/content/communities";
import { homes } from "@/content/homes";
import { toSection } from "@/lib/links";
import { archMask, DUSK, OfficeClock } from "./footer";

const count = (deal: string) => homes.filter((h) => h.deal === deal).length;

// Buy, Rent and Off-plan open the marketplace; the rest are sections of the home page.
const links = (here: readonly string[]) => ({
  nav: [
    { label: "Buy", href: "/homes?deal=buy" },
    { label: "Rent", href: "/homes?deal=rent" },
    { label: "Off-plan", href: "/homes?deal=offplan" },
    { label: "Sell", href: toSection("selling", here) },
    { label: "Communities", href: toSection("communities", here) },
  ],
  /** The phone menu's links, each with a small live hint of what's behind it. */
  menu: [
    { label: "Buy", href: "/homes?deal=buy", hint: `${count("buy")} homes for sale` },
    { label: "Rent", href: "/homes?deal=rent", hint: `${count("rent")} homes to rent` },
    { label: "Off-plan", href: "/homes?deal=offplan", hint: `${count("offplan")} new launches` },
    { label: "Communities", href: toSection("communities", here), hint: `${communities.length} areas on the map` },
    { label: "Your area", href: toSection("where-to-live", here), hint: "Matched to your commute" },
    { label: "Costs", href: toSection("buying", here), hint: "Fees, step by step" },
    { label: "From abroad", href: toSection("from-abroad", here), hint: "Visas, and no need to fly in" },
    { label: "Sell", href: toSection("selling", here), hint: "What your home is worth" },
    { label: "Viewings", href: toSection("viewing", here), hint: "In person or video" },
  ],
});

/** A round seal with the name set around the edge, like a stamped plaster mark. */
function Seal() {
  return (
    <svg viewBox="0 0 100 100" className="size-[58px] md:size-[68px]" aria-hidden>
      <defs>
        <path id="seal-ring" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fontSize="10.5" letterSpacing="3.2" fontWeight="700" fill="currentColor">
        <textPath href="#seal-ring">SARAYA · ESTATES · DUBAI ·</textPath>
      </text>
      <text x="50" y="61" textAnchor="middle" fontSize="32" fontFamily="var(--font-bodoni)" fontStyle="italic" fill="currentColor">
        S
      </text>
    </svg>
  );
}

/**
 * On the home page (`hero`) it appears once the window has lifted away, driven
 * by the hero timeline, then stays. On other pages it's there from the start.
 * `here` lists the home-page sections that exist on the current page.
 */
export function Header({ hero = false, here = [] }: { hero?: boolean; here?: readonly string[] }) {
  const { nav, menu } = links(here);
  const [open, setOpenState] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLAnchorElement>(null);

  // Lock and unlock in the same click, so a link's smooth scroll isn't swallowed by the lock.
  const setOpen = (v: boolean) => {
    setOpenState(v);
    document.documentElement.style.overflow = v ? "hidden" : "";
    window.dispatchEvent(new CustomEvent("saraya:lock", { detail: v }));
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => first.current?.focus({ preventScroll: true }), 300);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    // The menu is phone-only; turning a tablet to landscape closes it.
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <>
      <header
        data-header
        data-open={open}
        className={`group/h fixed inset-x-0 top-0 z-50 bg-[#f4eee5]/80 backdrop-blur-md ${hero ? "invisible opacity-0" : ""} transition-[background-color] duration-500 data-[open=true]:bg-transparent data-[open=true]:backdrop-blur-none`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 md:px-10 md:py-5">
          <a href={hero ? "#" : "/"} aria-label="Saraya Estates home" onClick={() => open && setOpen(false)} className="text-ink transition-colors duration-500 group-data-[open=true]/h:text-ivory">
            <Seal />
          </a>
          <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
            {nav.map((n) => (
              <a key={n.label} href={n.href} className="text-[14px] font-semibold tracking-[0.12em] text-ink/80 transition hover:text-gold-dark">
                {n.label.toUpperCase()}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={toSection("viewing", here)}
              onClick={() => open && setOpen(false)}
              className="rounded-full bg-ink px-5 py-3 text-[13.5px] font-bold text-ivory transition duration-500 hover:bg-gold-dark group-data-[open=true]/h:bg-ivory group-data-[open=true]/h:text-ink md:px-6"
            >
              Book a viewing
            </a>
            <button
              ref={toggle}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="phone-menu"
              onClick={() => setOpen(!open)}
              className="relative grid size-11 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 group-data-[open=true]/h:border-ivory/25 group-data-[open=true]/h:text-ivory md:hidden"
            >
              {/* Two lines that cross into an X */}
              <span className="absolute h-[1.5px] w-[18px] -translate-y-[3.5px] rounded-full bg-current transition-transform duration-500 ease-out-soft group-data-[open=true]/h:translate-y-0 group-data-[open=true]/h:rotate-45" />
              <span className="absolute h-[1.5px] w-[18px] translate-y-[3.5px] rounded-full bg-current transition-transform duration-500 ease-out-soft group-data-[open=true]/h:translate-y-0 group-data-[open=true]/h:-rotate-45" />
            </button>
          </div>
        </div>
      </header>

      {/* The phone menu: drops like a curtain with a curved hem (an ellipse growing down from the top). */}
      <div
        id="phone-menu"
        data-open={open}
        data-lenis-prevent
        inert={!open}
        aria-hidden={!open}
        className="group/m fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-ink text-ivory [clip-path:ellipse(100%_0%_at_50%_0%)] transition-[clip-path] duration-[600ms] ease-[cubic-bezier(0.7,0,0.3,1)] data-[open=true]:[clip-path:ellipse(100%_120%_at_50%_0%)] data-[open=true]:duration-[850ms] motion-reduce:transition-none md:hidden"
      >
        <div className="flex min-h-full flex-col px-5 pt-[104px] pb-8">
          <nav aria-label="Menu">
            <ul>
              {menu.map((m, i) => (
                <li key={m.label} className="overflow-hidden border-b border-white/10">
                  <a
                    ref={i === 0 ? first : undefined}
                    href={m.href}
                    onClick={() => setOpen(false)}
                    style={{ transitionDelay: open ? `${260 + i * 65}ms` : "0ms" }}
                    className="flex translate-y-[110%] items-baseline justify-between gap-4 py-3 opacity-0 transition-[translate,opacity] duration-[700ms] ease-out-soft group-data-[open=true]/m:translate-y-0 group-data-[open=true]/m:opacity-100 motion-reduce:transition-none"
                  >
                    <span className="font-display text-[clamp(28px,7.6vw,38px)] leading-[1.05] font-semibold">{m.label}</span>
                    <span className="max-w-[130px] text-right text-[13px] leading-snug font-semibold text-balance text-gold">{m.hint}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            style={{ transitionDelay: open ? "700ms" : "0ms" }}
            className="mt-auto flex translate-y-6 items-end gap-5 pt-10 opacity-0 transition-[translate,opacity] duration-[800ms] ease-out-soft group-data-[open=true]/m:translate-y-0 group-data-[open=true]/m:opacity-100 motion-reduce:transition-none"
          >
            <div className="relative aspect-[100/160] w-[72px] shrink-0 overflow-hidden" style={{ maskImage: archMask, maskSize: "100% 100%", WebkitMaskImage: archMask, WebkitMaskSize: "100% 100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
              <img
                src={photo(DUSK, 300)}
                alt=""
                className="size-full scale-125 object-cover transition-[scale] delay-300 duration-[1400ms] ease-out-soft group-data-[open=true]/m:scale-100"
              />
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/45">OFFICE · DIFC, DUBAI</p>
              <div className="mt-2">{open && <OfficeClock dark />}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
