"use client";

import { Check, Clock, Globe, MapPin, Video } from "lucide-react";
import { useEffect, useState } from "react";

import { photo } from "@/content/communities";
import { homes, priceLabel } from "@/content/homes";
import {
  agentFor,
  cities,
  dubaiInstant,
  hourIn,
  type Language,
  languages,
  nextDays,
  slots,
  timeIn,
  viewingHomes,
} from "@/content/viewing";

const dayName = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short" });
const dayNum = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const longDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mt-9 text-[13px] font-bold tracking-[0.2em] text-stone">{children}</p>;
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-semibold transition ${
        on ? "bg-ink text-ivory" : "bg-white text-ink/75 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Book a viewing: pick the home, in person or on a video call, your language
 * and a time. On a video call the times show in your own city's clock.
 */
export function Viewing() {
  // Dates and the viewer's time zone come from their clock, so they are set after mount.
  const [days, setDays] = useState<Date[]>([]);
  const [home, setHome] = useState(viewingHomes[0].id);
  const [video, setVideo] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [city, setCity] = useState(cities[0]);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [sentFor, setSentFor] = useState("");
  // A home picked from the listings ("Book a viewing" on it) joins the choices, first.
  const [picked, setPicked] = useState<(typeof viewingHomes)[number] | null>(null);
  const options = picked ? [picked, ...viewingHomes.filter((x) => x.id !== picked.id)].slice(0, 3) : viewingHomes;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const id = (e.target as Element).closest<HTMLElement>("[data-book]")?.dataset.book;
      const l = homes.find((x) => x.id === id);
      if (!l) return;
      setPicked({ id: l.id, name: l.name, area: l.area, price: priceLabel(l), photo: l.photos[0].id });
      setHome(l.id);
      if (l.deal === "offplan") setVideo(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const here = cities.find((c) => c.tz === tz);
    /* eslint-disable react-hooks/set-state-in-effect -- both depend on the viewer's clock */
    setDays(nextDays(7));
    if (here) setCity(here);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const h = options.find((x) => x.id === home) ?? options[0];
  const agent = agentFor(h.area, lang);
  const first = agent.name.split(" ")[0];
  const d = days[day];
  const langLabel = languages.find((l) => l.id === lang)!.label;
  const when = d && slot ? dubaiInstant(d, slot) : null;
  // A request belongs to these exact choices; change any of them and you can send again.
  const choice = [home, video, lang, city.name, day, slot].join("|");
  const sent = sentFor === choice;

  return (
    <section id="viewing" className="scroll-mt-16 bg-[#f4eee5] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14">
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">Book a viewing</h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-ink/70">
            See the home in person, or let your agent walk you round it on a video call from wherever you are.
          </p>

          <Label>WHICH HOME</Label>
          <div className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {options.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={x.id === home}
                onClick={() => setHome(x.id)}
                className={`w-[64vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-white text-left transition sm:w-auto sm:max-w-none ${
                  x.id === home ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                <img src={photo(x.photo, 600)} alt="" className="aspect-[16/10] w-full object-cover" />
                <span className="block p-3">
                  <span className="block text-[15px] font-semibold">{x.name}</span>
                  <span className="block text-[13px] text-stone">
                    {x.area} · {x.price}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Label>HOW</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip on={!video} onClick={() => setVideo(false)}>
              <MapPin className="size-4" /> In person
            </Chip>
            <Chip on={video} onClick={() => setVideo(true)}>
              <Video className="size-4" /> Video call
            </Chip>
          </div>

          <Label>IN WHICH LANGUAGE</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.map((l) => (
              <Chip key={l.id} on={l.id === lang} onClick={() => setLang(l.id)}>
                <span lang={l.id}>{l.native}</span>
              </Chip>
            ))}
          </div>

          {video && (
            <div className="animate-[rise_.45s_var(--ease-out-soft)]">
              <Label>I&apos;M IN</Label>
              <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                {cities.map((c) => (
                  <Chip key={c.name} on={c.name === city.name} onClick={() => setCity(c)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <Label>DAY</Label>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {days.map((x, i) => (
              <button
                key={x.toISOString()}
                type="button"
                aria-pressed={i === day}
                onClick={() => setDay(i)}
                className={`grid w-[76px] shrink-0 place-items-center rounded-2xl py-3 transition ${i === day ? "bg-ink text-ivory" : "bg-white text-ink/75"}`}
              >
                <span className="text-[12.5px] font-bold tracking-wide">{dayName(x).toUpperCase()}</span>
                <span className="text-[15px] font-semibold">{dayNum(x)}</span>
              </button>
            ))}
          </div>

          <Label>{video ? `TIME IN ${city.name.toUpperCase()}` : "TIME (DUBAI)"}</Label>
          <div key={video ? city.name : "dubai"} className="mt-3 flex animate-[fade_.4s_ease-out] flex-wrap gap-2">
            {d &&
              slots.map((t) => {
                const at = dubaiInstant(d, t);
                const local = hourIn(at, city.tz);
                const awake = !video || (local >= 8 && local <= 22) || slot === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={slot === t}
                    onClick={() => setSlot(t)}
                    title={video && !awake ? (local < 8 ? "Early for you" : "Late for you") : undefined}
                    className={`grid min-w-[72px] place-items-center rounded-2xl px-3 py-2.5 transition ${
                      slot === t ? "bg-ink text-ivory" : "bg-white text-ink/80 hover:text-ink"
                    } ${awake ? "" : "opacity-40"}`}
                  >
                    <span className="text-[15px] font-semibold tabular-nums">{video ? timeIn(at, city.tz) : `${t}:00`}</span>
                    {video && <span className={`text-[11.5px] tabular-nums ${slot === t ? "text-ivory/60" : "text-stone"}`}>{t}:00 Dubai</span>}
                  </button>
                );
              })}
          </div>
          {video && <p className="mt-3 text-[13px] text-stone">Faded times are before 8:00 or after 22:00 where you are.</p>}
        </div>

        {/* The ticket */}
        <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_40px_80px_-50px_rgb(40_28_16/0.6)] lg:sticky lg:top-28">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
          <img key={h.id} src={photo(h.photo, 900)} alt={h.name} className="aspect-[16/9] w-full animate-[fade_.5s_ease-out] object-cover" />
          <div className="p-6">
            <p className="text-[13px] font-bold tracking-[0.2em] text-stone">YOUR VIEWING</p>
            <p className="mt-2 font-display text-[28px] leading-tight font-semibold">{h.name}</p>
            <div key={agent.name} className="mt-4 flex animate-[fade_.4s_ease-out] items-center gap-3 rounded-2xl bg-sand/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
              <img src={photo(agent.photo, 160)} alt="" className="size-12 rounded-xl object-cover object-top" />
              <p className="text-[14.5px] leading-snug">
                <b>{agent.name}</b> will show you round{lang === "en" ? "" : `, in ${langLabel}`}
              </p>
            </div>
            <ul className="mt-4 grid gap-2.5 text-[15px]">
              <li className="flex items-center gap-2.5">
                {video ? <Video className="size-4 shrink-0 text-gold-dark" /> : <MapPin className="size-4 shrink-0 text-gold-dark" />}
                {video ? `Video call, ${first} walks you round` : `At the home, ${h.area}`}
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-gold-dark" />
                {!d ? "…" : !when ? `${longDay(d)}, choose a time` : video ? `${longDay(d)}, ${timeIn(when, city.tz)} in ${city.name}` : `${longDay(d)}, ${slot}:00`}
              </li>
              {video && when && (
                <li className="flex items-center gap-2.5 text-stone">
                  <Globe className="size-4 shrink-0" />
                  That&apos;s {slot}:00 in Dubai
                </li>
              )}
            </ul>
            {sent ? (
              <p className="mt-6 flex animate-[rise_.4s_var(--ease-out-soft)] items-start gap-2 rounded-2xl bg-sand/70 p-4 text-[15px] font-semibold">
                <Check className="mt-0.5 size-5 shrink-0 text-gold-dark" /> Request sent. {first} will confirm on WhatsApp within the hour.
              </p>
            ) : (
              <button
                type="button"
                disabled={!when}
                onClick={() => setSentFor(choice)}
                className="mt-6 w-full rounded-full bg-ink py-4 text-[15px] font-bold text-ivory transition hover:bg-gold-dark disabled:opacity-35 disabled:hover:bg-ink"
              >
                {when ? (video ? "Request this video tour" : "Request this viewing") : "Choose a time"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
