"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const photo = (id: string, w = 2400) => `https://images.unsplash.com/${id}?w=${w}&q=82&fm=jpg`;

// Local, pre-graded images: the colour grade, sky tint and wall textures are baked in,
// so the browser isn't re-filtering and re-blending huge layers on every scroll frame.
// Sources: Unsplash photo-1773829126358 (the view), photo-1730402224803 + photo-1728509807162 (the wall).
// Generated with Gemini (made-up signs removed), enlarged to 4800px: the view starts zoomed in, so it needs the pixels.
const VIEW = "/hero/burj-hd";
const WALL = "/hero/wall.webp";
const OLIVE = "/deco/olive.webp"; // olive branch, cut out

/** The arched opening, as a path in a 100 x 160 box (semicircle on top). */
const ARCH = "M0 160 V50 A50 50 0 0 1 100 50 V160 Z";
/** The same arch as rounded corners: far cheaper to clip with than a mask while it scales. */
const ARCH_RADIUS = "50% 50% 0 0 / 31.25% 31.25% 0 0";
const LEFT_LEAF = "polygon(0% 31.25%, 2% 22%, 8% 13%, 17% 6%, 28% 1.6%, 40% 0%, 100% 0%, 100% 100%, 0% 100%)";
const RIGHT_LEAF = "polygon(0% 0%, 60% 0%, 72% 1.6%, 83% 6%, 92% 13%, 98% 22%, 100% 31.25%, 100% 100%, 0% 100%)";

const homes = [
  { name: "Serenity Villas", area: "Palm Jumeirah", beds: 5, size: "6,400 sq ft", price: "AED 18.5M", photo: "photo-1691055657042-0c4f28d5f1bf" },
  { name: "Al Barari Residence", area: "Al Barari", beds: 6, size: "8,100 sq ft", price: "AED 24M", photo: "photo-1782720829237-ec146b0afe0a", featured: true },
  { name: "Arabian Ranches Estate", area: "Arabian Ranches", beds: 4, size: "4,900 sq ft", price: "AED 9.8M", photo: "photo-1788022886933-fdce4bafb551" },
];

/** One glass door leaf: bronze frame with glazing bars, hinged on its outer edge. */
function Leaf({ side }: { side: "left" | "right" }) {
  return (
    <div
      data-leaf={side}
      className={`absolute top-0 h-full w-1/2 ${side === "left" ? "left-0 origin-left" : "right-0 origin-right"}`}
      style={{ clipPath: side === "left" ? LEFT_LEAF : RIGHT_LEAF, transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[1.25fr_1fr_1fr_1fr] border-[0.8svh] border-[#2f2924]">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="border-[0.3svh] border-[#2f2924] bg-linear-to-br from-white/55 via-[#dfe8e8]/15 to-white/35"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The opening sequence from the reference, restyled: a full-screen view of
 * Dubai pulls back to reveal it's framed by an arched window with bronze glass
 * doors, set in a limewash wall; then the window drifts away and the listings
 * arrive. One scrubbed timeline drives it all.
 */
export function WindowHero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    let idle = 0;
    const ctx = gsap.context(() => {
      const win = root.current!.querySelector<HTMLElement>("[data-window]")!;
      // Big enough that the straight part of the opening (below the arch) fills the screen.
      const startScale = () => Math.max(window.innerWidth / win.offsetWidth, window.innerHeight / (win.offsetHeight * 0.38)) * 1.12;

      // Load-in: the headline rises out of the skyline.
      gsap.from("[data-title] span", { yPercent: 110, duration: 1.4, stagger: 0.1, ease: "expo.out", delay: 0.2 });

      const phone = () => window.innerWidth < 768;

      // While scrolling, the scaled layers are kept as GPU images so each frame is cheap.
      // The browser draws those images once, at the scale of that moment, and enlarging
      // them blurs; so once scrolling pauses, drop the hint and it redraws them sharp.
      const layers = gsap.utils.toArray<HTMLElement>("[data-window], [data-view], [data-branch]");
      const moving = () => {
        layers.forEach((l) => (l.style.willChange = "transform"));
        clearTimeout(idle);
        idle = window.setTimeout(() => layers.forEach((l) => (l.style.willChange = "")), 180);
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          pin: "[data-stage]",
          start: "top top",
          end: () => `+=${window.innerHeight * 3.4}`,
          // Lenis already smooths the scroll; a short scrub keeps the scene from trailing behind it.
          scrub: 0.25,
          onUpdate: moving,
          invalidateOnRefresh: true,
        },
      });

      tl
        // 1. The view drifts up a little, like the video's slow pan.
        .fromTo("[data-view]", { yPercent: 3 }, { yPercent: 0, duration: 0.6, ease: "power1.inOut" }, 0)
        // 2. Pull back: the open doors come in from the edges, then the wall around them.
        .fromTo(win, { scale: startScale }, { scale: 1, duration: 0.45, ease: "power2.inOut" }, 0.15)
        // The view zooms in as the window pulls back, so the whole tower is in shot at the start.
        // xPercent keeps the Burj centred both zoomed out and zoomed in.
        .fromTo("[data-view]", { scale: 0.4, xPercent: -1.4 }, { scale: 1, xPercent: -3.4, duration: 0.45, ease: "power2.inOut" }, 0.15)
        .fromTo("[data-leaf=left]", { rotateY: -96 }, { rotateY: -122, duration: 0.4, ease: "power2.inOut" }, 0.18)
        .fromTo("[data-leaf=right]", { rotateY: 96 }, { rotateY: 122, duration: 0.4, ease: "power2.inOut" }, 0.18)
        .fromTo("[data-side=left] > *", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.03, ease: "power2.out" }, 0.5)
        .fromTo("[data-side=right] > *", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.03, ease: "power2.out" }, 0.53)
        .fromTo("[data-sprig]", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }, 0.5)
        // 3. The window lifts away; olive branches grow in; the next heading rises.
        .to("[data-side] > *", { opacity: 0, y: -40, duration: 0.12, stagger: 0.02 }, 0.78)
        .to(win, { scale: 0.32, y: () => -window.innerHeight * 0.75, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.8)
        .fromTo("[data-branch]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", stagger: 0.05 }, 0.86)
        .fromTo(document.querySelector("[data-header]"), { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.95)
        .fromTo("[data-discover] > *", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2, stagger: 0.04, ease: "power3.out" }, 1.04)
        // 4. The listings slide up, the heading makes room.
        .to("[data-discover]", { y: () => -window.innerHeight * (phone() ? 0.13 : 0.15), duration: 0.25, ease: "power2.inOut" }, 1.25)
        .to("[data-discover] [data-copy]", { opacity: 0, duration: 0.12 }, 1.25)
        .fromTo("[data-home]", { opacity: 0, y: 160 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.06, ease: "power3.out" }, 1.3);
    }, root);
    // GSAP now holds the first frame, so the CSS stand-in (globals.css) can step aside.
    document.documentElement.dataset.heroReady = "";
    return () => {
      clearTimeout(idle);
      ctx.revert();
      delete document.documentElement.dataset.heroReady;
    };
  }, []);

  return (
    <section ref={root} data-hero aria-label="Saraya Estates">
      <div data-stage className="relative h-svh overflow-hidden">
        {/* The wall: limewash plaster with palm shadows drifting across it */}
        <div className="absolute inset-0 bg-[#f4eee5]">
          {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
          <img src={WALL} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-radial-[ellipse_at_50%_40%] from-transparent via-transparent to-[#5b4630]/10" />
        </div>

        {/* Olive branches that grow in from the corners in the second scene */}
        {/* GSAP owns the img transform, so the tilt and mirror live on the wrapper */}
        <div className="absolute -bottom-[10%] -left-[3%] z-10 w-[46vw] origin-bottom-left md:w-[24vw] rotate-[18deg]">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative */}
          <img data-branch src={OLIVE} alt="" className="w-full origin-bottom-left opacity-0 drop-shadow-[18px_24px_18px_rgb(60_40_20/0.18)]" />
        </div>
        <div className="absolute -right-[3%] -bottom-[10%] z-10 w-[46vw] origin-bottom-right md:w-[24vw] -rotate-[18deg]">
          <div className="-scale-x-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative */}
            <img data-branch src={OLIVE} alt="" className="w-full origin-bottom-left opacity-0 drop-shadow-[18px_24px_18px_rgb(60_40_20/0.18)]" />
          </div>
        </div>

        {/* Headlines either side of the window */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center wide:grid wide:grid-cols-[1fr_minmax(0,auto)_1fr] wide:gap-[4vw] wide:px-[5vw] wide:text-left">
          <div data-side="left" className="wide:justify-self-end wide:text-right">
            <p className="text-[11px] font-bold tracking-[0.3em] text-gold-dark md:text-[13px]">SARAYA ESTATES</p>
            <p className="mt-2 font-display text-[38px] leading-[0.98] font-semibold tracking-[-0.02em] wide:mt-4 wide:text-[clamp(28px,calc((82vw-73.7svh)/8.6),92px)]">
              The leading
              <br />
              <em className="text-gold">luxury</em>
            </p>
          </div>
          <div className="h-[calc(40svh+6svh)] wide:h-auto wide:w-[calc(66svh*0.62*1.8)]" aria-hidden />
          <div data-side="right">
            <p className="text-[11px] font-bold tracking-[0.3em] text-gold-dark md:text-[13px]">SINCE 2009</p>
            <p className="mt-2 font-display text-[38px] leading-[0.98] font-semibold tracking-[-0.02em] wide:mt-4 wide:text-[clamp(28px,calc((82vw-73.7svh)/8.6),92px)]">
              Property portal
              <br />
              in <em className="text-gold">Dubai</em>
            </p>
          </div>
        </div>

        {/* The window: view + wall hole + bronze frame + doors + sill, scaled as one */}
        <div className="absolute inset-0 z-10 grid place-items-center">
          <div data-window className="relative h-[40svh] w-[calc(40svh*0.62)] wide:h-[66svh] wide:w-[calc(66svh*0.62)]" style={{ transformStyle: "preserve-3d", perspective: "900px" }}>
            {/* The view of Dubai inside the opening, with the title on it */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: ARCH_RADIUS }}>
              {/* Wider than the opening so it can start zoomed out and still fill the screen */}
              <div data-view className="absolute -inset-y-[8%] -inset-x-[110%]">
                <picture>
                  <source srcSet={`${VIEW}.avif`} type="image/avif" />
                  <img src={`${VIEW}.webp`} alt="The Burj Khalifa and Downtown Dubai across the water" fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover object-[65%_50%]" />
                </picture>
              </div>
              <h1 data-title className="absolute inset-x-0 top-[38%] text-center font-display text-[1svh] leading-[0.9] wide:text-[2.6svh] font-semibold text-white drop-shadow-[0_1px_8px_rgb(0_0_0/0.25)]">
                <span className="block overflow-hidden"><span className="block">Dubai</span></span>
                <span className="block overflow-hidden"><span className="block italic">Real Estate</span></span>
              </h1>
              {/* Deep plaster reveal: soft shadow inside the opening's edge */}
              <div className="absolute inset-0 shadow-[inset_0_0_0_0.6svh_rgb(110_86_58/0.35),inset_0_0_3svh_rgb(40_28_16/0.45)]" />
            </div>
            {/* Bronze frame around the arch */}
            <svg viewBox="0 0 100 160" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="bronze" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#c7a46c" />
                  <stop offset="0.5" stopColor="#7d5f37" />
                  <stop offset="1" stopColor="#a8854f" />
                </linearGradient>
              </defs>
              {/* A soft shadow drawn as a wider, faint stroke, instead of a CSS drop-shadow re-rendered every frame */}
              <path d={ARCH} fill="none" stroke="rgb(60 40 20 / 0.08)" strokeWidth="44" vectorEffect="non-scaling-stroke" transform="translate(0 1.5)" />
              <path d={ARCH} fill="none" stroke="#f4ede2" strokeWidth="26" vectorEffect="non-scaling-stroke" />
              <path d={ARCH} fill="none" stroke="url(#bronze)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
              <path d={ARCH} fill="none" stroke="#3b2a17" strokeOpacity="0.35" strokeWidth="1" transform="translate(1.5 1.5) scale(0.97 0.98)" />
            </svg>
            <Leaf side="left" />
            <Leaf side="right" />
            {/* Stone sill with a small olive sprig */}
            <div className="absolute -bottom-[2.2svh] left-1/2 h-[2.4svh] w-[124%] -translate-x-1/2 rounded-[3px] bg-linear-to-b from-[#efe6d8] via-[#ddd0bc] to-[#b9a88f] shadow-[0_18px_30px_-12px_rgb(60_40_20/0.55)]" />
            <div data-sprig className="absolute right-[5%] bottom-[0.2svh] z-10 w-[24%] origin-bottom opacity-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative */}
              <img src={OLIVE} alt="" className="relative -mb-[18%] w-full -rotate-[6deg] drop-shadow-[6px_10px_8px_rgb(60_40_20/0.22)]" />
              <div className="relative mx-auto aspect-[1.25] w-[62%] rounded-t-[10%] rounded-b-[46%] bg-linear-to-b from-[#ece3d4] via-[#d8c9b2] to-[#b7a387] shadow-[0_8px_14px_-6px_rgb(60_40_20/0.45)]" />
            </div>
          </div>
        </div>

        {/* Second scene: heading, copy and the listings */}
        <div data-discover className="pointer-events-none absolute inset-x-0 top-[24svh] z-30 mx-auto max-w-[900px] px-6 text-center">
          <p className="text-[13px] font-bold tracking-[0.3em] text-gold-dark">DISCOVER</p>
          <h2 className="mt-4 font-display text-[clamp(44px,4.6vw,84px)] leading-[0.95] font-semibold tracking-[-0.02em]">
            Exceptional luxury
            <br />
            homes in <em className="text-gold">Dubai</em>
          </h2>
          <div data-copy>
            <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-relaxed md:mt-6 md:text-[16.5px] text-ink/70">
              Saraya connects buyers with villas, penthouses and apartments in Palm Jumeirah, Emirates Hills and
              Downtown Dubai, each chosen for its architecture, quality and location.
            </p>
            <span className="pointer-events-auto mt-8 inline-grid size-16 place-items-center rounded-full bg-gold text-white shadow-[0_15px_35px_-12px_rgb(143_111_63/0.9)]">
              <Play className="ml-1 size-6 fill-white" />
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[34svh] z-30 mx-auto flex max-w-[1180px] snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-8 [scrollbar-width:none] md:top-[40svh] md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {homes.map((h) => (
            <article
              key={h.name}
              data-home
              className={`w-[78vw] max-w-[340px] shrink-0 snap-center rounded-[26px] p-3 opacity-0 shadow-[0_30px_60px_-35px_rgb(40_28_16/0.6)] md:w-auto md:max-w-none ${
                h.featured ? "bg-ink text-ivory md:-translate-y-4" : "bg-white"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- listing photo */}
                <img src={photo(h.photo, 900)} alt={h.name} className="absolute inset-0 size-full object-cover" />
                {h.featured && (
                  <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[12px] font-bold tracking-wide text-white">NEW LAUNCH</span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 px-2 pt-4 pb-2">
                <div>
                  <p className="font-display text-[24px] leading-tight font-semibold">{h.name}</p>
                  <p className={`mt-1 text-[14px] ${h.featured ? "text-ivory/60" : "text-stone"}`}>{h.area}</p>
                </div>
                <p className={`shrink-0 pt-1 text-[16px] font-bold whitespace-nowrap ${h.featured ? "text-gold" : ""}`}>{h.price}</p>
              </div>
              <p className={`flex gap-4 border-t px-2 pt-3 pb-1 text-[13.5px] ${h.featured ? "border-ivory/15 text-ivory/70" : "border-ink/10 text-stone"}`}>
                <span>{h.beds} beds</span>
                <span>{h.size}</span>
                <span>Sea view</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
