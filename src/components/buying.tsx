"use client";

import { BadgeCheck, FileSignature, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { aed, aedShort, GOLDEN_VISA_FROM, maxLoanShare, presets, purchaseCosts, steps } from "@/content/buying";
import { photo } from "@/content/communities";

/** A number that glides to its new value instead of jumping. */
function useGlide(target: number, ms = 600) {
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

function Money({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`tabular-nums ${className}`}>{aed(useGlide(value))}</span>;
}

/**
 * Buying in Dubai: pick a price and see every one-off fee, then walk the
 * steps from viewing to keys with the amounts for that same home.
 */
export function Buying() {
  const [price, setPrice] = useState(3_200_000);
  const [mortgage, setMortgage] = useState(false);
  const [step, setStep] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  const loan = mortgage ? price * maxLoanShare(price) : 0;
  const lines = purchaseCosts(price, loan);
  const fees = lines.reduce((s, l) => s + l.amount, 0);
  const cash = price - loan + fees;
  const golden = price >= GOLDEN_VISA_FROM;
  const s = steps[step];
  const deal = { price, loan };

  // On a phone the step tabs scroll sideways; keep the current one in view.
  useEffect(() => {
    const row = tabs.current;
    const tab = row?.children[step] as HTMLElement | undefined;
    if (row && tab) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.clientWidth) / 2, behavior: "smooth" });
  }, [step]);

  return (
    <section id="buying" className="bg-[#f4eee5] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        {/* What it costs */}
        <div className="grid gap-10 lg:grid-cols-[1fr_470px] lg:items-start lg:gap-14">
          <div>
            <h2 className="font-display text-[clamp(40px,4.4vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">What a Dubai home really costs</h2>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-ink/70">
              There is no yearly property tax in Dubai, but you pay a few fees once, on the day of transfer. Choose a price to see them all.
            </p>
            <label className="mt-10 block">
              <span className="text-[13px] font-bold tracking-[0.2em] text-stone">PRICE OF THE HOME</span>
              <span className="mt-2 block font-display text-[clamp(40px,5vw,56px)] leading-none font-semibold">
                <Money value={price} />
              </span>
              <input
                type="range"
                min={800_000}
                max={30_000_000}
                step={50_000}
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                aria-label="Price of the home"
                className="mt-6 w-full accent-[#8f6f3f]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPrice(p.price)}
                  className={`rounded-full px-4 py-2.5 text-[14px] font-semibold transition ${
                    p.price === price ? "bg-ink text-ivory" : "bg-white text-ink/75 hover:text-ink"
                  }`}
                >
                  {p.label} · {aedShort(p.price)}
                </button>
              ))}
            </div>
            <div className="mt-8 inline-flex rounded-full bg-white p-1" role="group" aria-label="How you will pay">
              {(
                [
                  ["Paying cash", false],
                  ["With a mortgage", true],
                ] as const
              ).map(([label, m]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={mortgage === m}
                  onClick={() => setMortgage(m)}
                  className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${mortgage === m ? "bg-ink text-ivory" : "text-ink/70"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* The receipt */}
          <div className="rounded-[26px] bg-white p-6 shadow-[0_40px_80px_-50px_rgb(40_28_16/0.6)] md:p-7">
            <p className="text-[13px] font-bold tracking-[0.2em] text-stone">PAID ONCE, ON TRANSFER DAY</p>
            <ul className="mt-3">
              {lines.map((l) => (
                <li key={l.label} className="flex animate-[fade_.4s_ease-out] items-start justify-between gap-5 border-b border-dashed border-ink/15 py-4">
                  <div>
                    <p className="text-[15.5px] font-semibold">{l.label}</p>
                    <p className="text-[13.5px] text-stone">{l.note}</p>
                  </div>
                  <Money value={l.amount} className="shrink-0 pt-0.5 text-[15.5px] font-semibold" />
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between gap-4 pt-5">
              <p className="text-[15px] font-bold">Fees in total</p>
              <Money value={fees} className="font-display text-[28px] font-semibold md:text-[30px]" />
            </div>
            <p className="mt-1 text-right text-[13.5px] text-stone">{((fees / price) * 100).toFixed(1)}% on top of the price</p>
            <div className="mt-6 flex items-baseline justify-between gap-4 rounded-2xl bg-sand/60 p-4">
              <p className="text-[14.5px] font-semibold">
                {mortgage ? `Cash you need (${Math.round((1 - maxLoanShare(price)) * 100)}% deposit + fees)` : "Cash you need in all"}
              </p>
              <Money value={cash} className="shrink-0 text-[17px] font-bold" />
            </div>
            <p className={`mt-4 flex items-center gap-2 text-[14.5px] font-semibold transition ${golden ? "text-gold-dark" : "text-stone"}`}>
              <BadgeCheck className="size-5 shrink-0" />
              {golden ? "Qualifies you for a 10-year Golden Visa" : `Golden Visa needs a home worth ${aedShort(GOLDEN_VISA_FROM)} or more`}
            </p>
          </div>
        </div>

        {/* How it happens */}
        <div className="mt-20 md:mt-28">
          <h3 className="font-display text-[clamp(32px,3.4vw,52px)] leading-[1.02] font-semibold tracking-[-0.01em]">From viewing to keys in about four weeks</h3>
          <div ref={tabs} className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
            {steps.map((x, k) => (
              <button
                key={x.title}
                type="button"
                aria-pressed={k === step}
                onClick={() => setStep(k)}
                className={`shrink-0 rounded-full px-5 py-3 text-[14.5px] font-semibold transition ${
                  k === step ? "bg-ink text-ivory" : k < step ? "bg-gold/25 text-ink" : "bg-sand text-ink/65 hover:text-ink"
                }`}
              >
                {x.title}
              </button>
            ))}
          </div>
          <div className="mt-6 grid overflow-hidden rounded-[28px] bg-sand lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[260px] md:min-h-[400px]">
              {steps.map((x, k) => (
                // eslint-disable-next-line @next/next/no-img-element -- remote photo
                <img
                  key={x.title}
                  src={photo(x.photo, 1400)}
                  alt=""
                  className={`absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 ease-out-soft ${
                    k === step ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
              <p className="absolute top-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[14px] font-bold">{s.time}</p>
            </div>
            <div key={step} className="animate-[rise_.5s_var(--ease-out-soft)] p-6 md:p-10">
              <p className="font-display text-[clamp(28px,3vw,36px)] leading-tight font-semibold">{s.title}</p>
              <p className="mt-4 text-[16px] leading-relaxed text-ink/75">{s.body(deal)}</p>
              <dl className="mt-7 grid gap-3">
                <div className="flex gap-3 rounded-2xl bg-white p-4">
                  <Wallet className="mt-0.5 size-5 shrink-0 text-gold-dark" />
                  <div>
                    <dt className="text-[12.5px] font-bold tracking-[0.16em] text-stone">YOU PAY</dt>
                    <dd className="text-[15.5px] font-semibold">{s.pay(deal)}</dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl bg-white p-4">
                  <FileSignature className="mt-0.5 size-5 shrink-0 text-gold-dark" />
                  <div>
                    <dt className="text-[12.5px] font-bold tracking-[0.16em] text-stone">BRING</dt>
                    <dd className="text-[15.5px] font-semibold">{s.bring}</dd>
                  </div>
                </div>
              </dl>
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border border-ink/15 px-5 py-3 text-[14px] font-semibold disabled:opacity-30"
                >
                  Back
                </button>
                {step < steps.length - 1 ? (
                  <button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-ivory">
                    Next step
                  </button>
                ) : (
                  <a href="#viewing" className="rounded-full bg-gold-dark px-5 py-3 text-[14px] font-semibold text-ivory">
                    Book a viewing
                  </a>
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12.5px] text-stone">Fees are the ones commonly quoted for 2026. Check the latest with the Dubai Land Department before you pay.</p>
        </div>
      </div>
    </section>
  );
}
