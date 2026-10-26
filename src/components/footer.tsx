"use client";

import { Car, Clock, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";

import { communities, photo } from "@/content/communities";
import { office } from "@/content/viewing";

export const DUSK = "photo-1749023098108-97924877ef74"; // the Burj at sunset, from the beach
const ARCH = "M0 160 V50 A50 50 0 0 1 100 50 V160 Z"; // the same arch as the hero window
export const archMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 160' preserveAspectRatio='none'><path d='${ARCH}' fill='black'/></svg>`,
)}")`;

/** Office hours by weekday, Dubai time. Sunday is viewings by appointment only. */
const hours: Record<string, [number, number] | null> = { Mon: [9, 19], Tue: [9, 19], Wed: [9, 19], Thu: [9, 19], Fri: [9, 19], Sat: [10, 16], Sun: null };
const week = Object.keys(hours);
const dayNames: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

function dubaiNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "short", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  // Hours between the viewer's clock and Dubai, which is UTC+4 all year.
  const ahead = 4 + new Date().getTimezoneOffset() / 60;
  return { day: get("weekday"), h: +get("hour"), m: +get("minute"), ahead };
}

function officeStatus({ day, h, m }: ReturnType<typeof dubaiNow>) {
  const t = h + m / 60;
  const today = hours[day];
  if (today && t >= today[0] && t < today[1]) return { open: true, text: `Open now, until ${today[1]}:00` };
  if (today && t < today[0]) return { open: false, text: `Closed, opens today at ${today[0]}:00` };
  for (let i = 1; i <= 7; i++) {
    const next = week[(week.indexOf(day) + i) % 7];
    if (hours[next]) return { open: false, text: `Closed, opens ${i === 1 ? "tomorrow" : dayNames[next]} at ${hours[next]![0]}:00` };
  }
  return { open: false, text: "Closed" };
}

/** "11:22 in Dubai · Open now", kept current; empty until mounted so server and browser agree. */
export function OfficeClock({ dark = false }: { dark?: boolean }) {
  const [now, setNow] = useState<ReturnType<typeof dubaiNow> | null>(null);
  useEffect(() => {
    const tick = () => setNow(dubaiNow());
    tick();
    const t = setInterval(tick, 20_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <div className="h-[52px]" />;
  const s = officeStatus(now);
  const a = Math.abs(now.ahead);
  return (
    <div className="animate-[fade_.4s_ease-out] text-[14.5px]">
      <p className="flex items-center gap-2 font-semibold">
        <span className={`size-2 shrink-0 rounded-full ${s.open ? "bg-[#2f9e6a]" : dark ? "bg-ivory/30" : "bg-stone/50"}`} />
        {s.text}
      </p>
      <p className={`mt-1 flex items-center gap-2 ${dark ? "text-ivory/55" : "text-stone"}`}>
        <Clock className="size-3.5 shrink-0" />
        <span>
          <span className="tabular-nums">
            {String(now.h).padStart(2, "0")}:{String(now.m).padStart(2, "0")}
          </span>{" "}
          in Dubai{now.ahead !== 0 && `, ${a} ${a === 1 ? "hour" : "hours"} ${now.ahead > 0 ? "ahead of" : "behind"} you`}
        </span>
      </p>
    </div>
  );
}

const head = "text-[12.5px] font-bold tracking-[0.2em] text-stone";
const link = "text-[15px] text-ink/80 transition hover:text-gold-dark";

/**
 * The footer bookends the hero: the same arch window, now at dusk, with one
 * last way to book, the office (open right now?) and the site's links.
 */
export function Footer() {
  return (
    <footer className="bg-[#efe6d8] px-5 pt-20 pb-8 md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
          <div className="relative mx-auto aspect-[100/160] w-[58vw] max-w-[340px] md:w-full">
            <div className="absolute inset-0" style={{ maskImage: archMask, maskSize: "100% 100%", WebkitMaskImage: archMask, WebkitMaskSize: "100% 100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
              <img src={photo(DUSK, 1000)} alt="The Burj Khalifa at sunset" loading="lazy" className="size-full object-cover" />
            </div>
            <svg viewBox="0 0 100 160" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <path d={ARCH} fill="none" stroke="#2f2924" strokeWidth="6" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-[clamp(40px,5vw,80px)] leading-[0.98] font-semibold tracking-[-0.02em]">See the view for yourself</h2>
            <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-ink/70">
              Visit a home in person, or walk round it on a video call from wherever you are.
            </p>
            <a href="#viewing" className="mt-8 inline-block rounded-full bg-ink px-7 py-4 text-[15px] font-bold text-ivory transition hover:bg-gold-dark">
              Book a viewing
            </a>

            <div className="mt-14 grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[1.05fr_1.4fr]">
              <div>
                <p className={head}>OFFICE</p>
                <p className="mt-4 text-[15.5px] font-semibold">{office.address.join(", ")}</p>
                <p className="mt-1 text-[14.5px] text-stone">Mon to Fri 9:00 to 19:00 · Sat 10:00 to 16:00</p>
                <div className="mt-4">
                  <OfficeClock />
                </div>
                <ul className="mt-4 grid gap-2 text-[14.5px]">
                  <li className="flex items-center gap-2">
                    <TrainFront className="size-4 shrink-0 text-gold-dark" /> {office.getting[0][1]}
                  </li>
                  <li className="flex items-center gap-2">
                    <Car className="size-4 shrink-0 text-gold-dark" /> {office.getting[1][1]}
                  </li>
                </ul>
              </div>

              <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <p className={head}>HOMES</p>
                  <ul className="mt-4 grid gap-2.5">
                    <li><a href="#homes" data-deal="buy" className={link}>Buy</a></li>
                    <li><a href="#homes" data-deal="rent" className={link}>Rent</a></li>
                    <li><a href="#homes" data-deal="offplan" className={link}>Off-plan</a></li>
                  </ul>
                </div>
                <div>
                  <p className={head}>AREAS</p>
                  <ul className="mt-4 grid gap-2.5">
                    {communities.map((c) => (
                      <li key={c.id}>
                        <a href="#homes" data-community={c.id} className={link}>{c.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={head}>BUYING</p>
                  <ul className="mt-4 grid gap-2.5">
                    <li><a href="#buying" className={link}>What it costs</a></li>
                    <li><a href="#communities" className={link}>Where to buy</a></li>
                    <li><a href="#viewing" className={link}>Book a viewing</a></li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-3 border-t border-ink/10 pt-6 text-[13px] text-stone">
          <p>Saraya Estates is a design concept by Hammad Ali. Listings, agents and prices are examples.</p>
          <p>Photos: Unsplash · Map: OpenFreeMap</p>
        </div>
      </div>
    </footer>
  );
}
