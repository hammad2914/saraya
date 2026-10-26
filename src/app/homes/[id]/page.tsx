import { Check, Plane, TrainFront, Waves } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { Header } from "@/components/header";
import { HomeCard } from "@/components/home-card";
import { HomesMap } from "@/components/homes-map";
import { Viewing } from "@/components/viewing";
import { aed, GOLDEN_VISA_FROM, maxLoanShare, purchaseCosts, VAT } from "@/content/buying";
import { communities, photo } from "@/content/communities";
import { dealLabels, type Home, homeById, homes, priceLabel } from "@/content/homes";
import { agentFor, agents, languages } from "@/content/viewing";
import { toSection } from "@/lib/links";

// Every home is prerendered from generateStaticParams, so a blocking render is fine here.
export const instant = false;

export function generateStaticParams() {
  return homes.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: PageProps<"/homes/[id]">): Promise<Metadata> {
  const h = homeById((await params).id);
  return h ? { title: `${h.name}, ${h.area} | Saraya Estates`, description: h.about } : {};
}

/** An example mortgage: the most an expat can borrow, at a typical 2026 rate. */
const RATE = 0.0425;
const YEARS = 25;
function monthly(h: Home) {
  const loan = h.price * maxLoanShare(h.price);
  const r = RATE / 12;
  return (loan * r) / (1 - (1 + r) ** -(YEARS * 12));
}

/** One-off costs of renting, as commonly quoted in Dubai for 2026. */
function rentCosts(h: Home) {
  const furnished = h.features.includes("Furnished") || h.features.includes("Serviced");
  return [
    { label: "Security deposit", note: furnished ? "10% of the rent, for a furnished home, returned at the end" : "5% of the rent, returned at the end", amount: h.price * (furnished ? 0.1 : 0.05) },
    { label: "Agency fee", note: "5% of the rent, plus VAT", amount: h.price * 0.05 * (1 + VAT) },
    { label: "Ejari registration", note: "Registers the lease with the city", amount: 220 },
    { label: "DEWA deposit", note: "Water and power, returned when you leave", amount: h.kind === "Apartment" || h.kind === "Penthouse" ? 2000 : 4000 },
  ];
}

const H2 = "font-display text-[clamp(28px,2.6vw,38px)] leading-tight font-semibold";

function CostTable({ rows, total, totalLabel }: { rows: { label: string; note: string; amount: number }[]; total: number; totalLabel: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-[22px] bg-white">
      <ul className="divide-y divide-ink/8">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-6 px-5 py-4 md:px-6">
            <span>
              <span className="block text-[15.5px] font-semibold">{r.label}</span>
              <span className="block text-[13.5px] text-stone">{r.note}</span>
            </span>
            <span className="shrink-0 text-[15.5px] font-semibold tabular-nums">{aed(r.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="flex items-baseline justify-between gap-6 bg-ink px-5 py-4 text-ivory md:px-6">
        <span className="text-[15px] font-semibold">{totalLabel}</span>
        <span className="font-display text-[24px] font-semibold tabular-nums">{aed(total)}</span>
      </p>
    </div>
  );
}

export default async function HomePage({ params }: PageProps<"/homes/[id]">) {
  const h = homeById((await params).id);
  if (!h) notFound();
  const c = communities.find((x) => x.id === h.community)!;
  const agent = h.deal === "offplan" ? agents.find((a) => a.role === "Off-plan launches")! : agentFor(h.area, "en");
  const ref = `SAR-${String(homes.indexOf(h) + 101).padStart(4, "0")}`;
  const similar = [
    ...homes.filter((x) => x.id !== h.id && x.community === h.community && x.deal === h.deal),
    ...homes.filter((x) => x.id !== h.id && x.community !== h.community && x.deal === h.deal && x.kind === h.kind),
  ].slice(0, 3);

  const facts = [
    [h.beds, h.beds === 1 ? "Bedroom" : "Bedrooms"],
    [h.baths, h.baths === 1 ? "Bathroom" : "Bathrooms"],
    [h.sqft.toLocaleString("en-GB"), "Square feet"],
    h.handover ? [h.handover, "Keys handed over"] : [h.built, "Built"],
  ] as const;

  const buyCosts = purchaseCosts(h.price);

  return (
    <>
      <Header here={["viewing"]} />
      <main className="bg-ivory px-5 pt-[100px] md:px-10 md:pt-[128px]">
        <div className="mx-auto max-w-[1320px]">
          {/* Where you are */}
          <nav aria-label="Breadcrumb" className="text-[13.5px] text-stone">
            <a href={`/homes?deal=${h.deal}`} className="transition hover:text-ink">
              {dealLabels[h.deal]}
            </a>
            <span className="mx-2">/</span>
            <a href={`/homes?deal=${h.deal}&community=${h.community}`} className="transition hover:text-ink">
              {c.name}
            </a>
            <span className="mx-2">/</span>
            <span className="text-ink">{h.name}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="min-w-0">
              <p className="text-[13px] font-bold tracking-[0.2em] text-gold-dark">
                {h.kind.toUpperCase()} · {h.deal === "buy" ? "FOR SALE" : h.deal === "rent" ? "TO RENT" : "OFF-PLAN"} · {h.area.toUpperCase()}
              </p>
              <h1 className="mt-2 font-display text-[clamp(38px,4.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.02em]">{h.name}</h1>
            </div>
            <div className="md:text-right">
              <p className="font-display text-[clamp(32px,3.2vw,48px)] leading-none font-semibold">{priceLabel(h)}</p>
              <p className="mt-2 text-[14px] text-stone">
                {h.deal === "rent"
                  ? `About ${aed(h.price / 12)} a month, in up to 4 cheques`
                  : `${aed(h.price / h.sqft)} per sq ft`}
              </p>
            </div>
          </div>

          <Gallery h={h} />

          <div className="mt-10 grid gap-12 pb-20 md:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <div className="min-w-0">
              {/* The numbers, in a row */}
              <dl className="grid grid-cols-2 gap-y-6 border-y border-ink/10 py-6 sm:grid-cols-4">
                {facts.map(([v, label], i) => (
                  <div key={label} className={`px-1 sm:px-5 ${i ? "sm:border-l sm:border-ink/10" : "sm:pl-0"}`}>
                    <dt className="text-[13px] text-stone">{label}</dt>
                    <dd className="mt-1 font-display text-[28px] leading-none font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <section className="mt-12">
                <h2 className={H2}>About this home</h2>
                <p className="mt-4 text-[18px] leading-relaxed font-semibold text-ink/85">{h.hook}.</p>
                <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-ink/70">{h.about}</p>
                <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {h.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-[15.5px]">
                      <Check className="size-4 shrink-0 text-gold-dark" strokeWidth={2.5} /> {f}
                    </li>
                  ))}
                </ul>
              </section>

              {h.plan && (
                <section className="mt-14">
                  <h2 className={H2}>How you pay for it</h2>
                  <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-ink/70">
                    Off-plan homes are paid for in stages while they are built, straight to the developer&apos;s escrow account.
                  </p>
                  {/* The plan as one bar, split in proportion */}
                  <div className="mt-7 flex h-3 overflow-hidden rounded-full">
                    <span className="bg-ink" style={{ width: `${h.plan.booking}%` }} />
                    <span className="bg-gold" style={{ width: `${h.plan.building}%` }} />
                    <span className="bg-sand" style={{ width: `${h.plan.handover}%` }} />
                  </div>
                  <ol className="mt-6 grid gap-6 sm:grid-cols-3">
                    {[
                      [h.plan.booking, "On booking", "Secures the home and your price", "bg-ink"],
                      [h.plan.building, "While it's built", "In instalments, as floors are finished", "bg-gold"],
                      [h.plan.handover, `At handover, ${h.handover}`, "When you get the keys", "bg-sand"],
                    ].map(([pct, label, note, dot]) => (
                      <li key={label as string}>
                        <p className="flex items-center gap-2 text-[14px] font-semibold">
                          <span className={`size-2.5 rounded-full ${dot}`} /> {label}
                        </p>
                        <p className="mt-2 font-display text-[30px] leading-none font-semibold">{pct}%</p>
                        <p className="mt-1.5 text-[15px] font-semibold tabular-nums">{aed((h.price * (pct as number)) / 100)}</p>
                        <p className="mt-1 text-[13.5px] text-stone">{note}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 rounded-2xl bg-sand/60 px-5 py-4 text-[14.5px]">
                    Also due when you book: the Land Department&apos;s 4% registration fee, <b>{aed(h.price * 0.04)}</b>.
                  </p>
                </section>
              )}

              {h.deal === "buy" && (
                <section className="mt-14">
                  <h2 className={H2}>What you pay on top</h2>
                  <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-ink/70">
                    Paying cash, these are the fees on the day of transfer. A mortgage adds a little more.
                  </p>
                  <CostTable rows={buyCosts} total={buyCosts.reduce((s, r) => s + r.amount, 0)} totalLabel="Fees in total" />
                  <a href={toSection("buying", [])} className="mt-4 inline-block text-[14.5px] font-semibold text-gold-dark underline-offset-4 hover:underline">
                    How buying works, step by step
                  </a>
                </section>
              )}

              {h.deal === "rent" && (
                <section className="mt-14">
                  <h2 className={H2}>Moving-in costs</h2>
                  <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-ink/70">
                    On top of the first rent cheque. The deposits come back when you move out.
                  </p>
                  {(() => {
                    const rows = rentCosts(h);
                    return <CostTable rows={rows} total={rows.reduce((s, r) => s + r.amount, 0)} totalLabel="Due before you move in" />;
                  })()}
                </section>
              )}

              <section className="mt-14">
                <h2 className={H2}>Where it is</h2>
                <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-ink/70">{c.why}</p>
                <HomesMap list={[h]} hot={h.id} maxZoom={13.2} className="mt-6 h-[360px] overflow-hidden rounded-[22px] bg-sand md:h-[420px]" />
                <ul className="mt-5 grid gap-3 text-[15px] sm:grid-cols-3">
                  <li className="flex items-center gap-2.5"><Plane className="size-4 shrink-0 text-gold-dark" /> {c.toAirport}</li>
                  <li className="flex items-center gap-2.5"><TrainFront className="size-4 shrink-0 text-gold-dark" /> {c.metro}</li>
                  <li className="flex items-center gap-2.5"><Waves className="size-4 shrink-0 text-gold-dark" /> {c.beach}</li>
                </ul>
              </section>
            </div>

            {/* The agent, beside everything above */}
            <aside className="lg:sticky lg:top-[128px] lg:self-start">
              <div className="rounded-[24px] bg-white p-6">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote photo */}
                  <img src={photo(agent.photo, 200)} alt="" className="size-16 rounded-2xl object-cover object-top" />
                  <div>
                    <p className="text-[17px] font-semibold">{agent.name}</p>
                    <p className="text-[14px] text-stone">{agent.role}</p>
                    <p className="mt-1 text-[13px] text-stone">
                      Speaks {agent.speaks.map((l) => languages.find((x) => x.id === l)!.label).join(", ")}
                    </p>
                  </div>
                </div>
                <a href="#viewing" className="mt-6 block rounded-full bg-ink py-4 text-center text-[15px] font-bold text-ivory transition hover:bg-gold-dark">
                  {h.deal === "offplan" ? "Book a video tour" : "Book a viewing"}
                </a>
                <dl className="mt-6 grid gap-3 border-t border-ink/10 pt-5 text-[14.5px]">
                  {h.deal === "buy" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone">Mortgage, as an example</dt>
                      <dd className="text-right font-semibold">{aed(monthly(h))} a month</dd>
                    </div>
                  )}
                  {h.deal !== "rent" && h.price >= GOLDEN_VISA_FROM && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone">Golden Visa</dt>
                      <dd className="text-right font-semibold">Qualifies, 10 years</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone">Listed</dt>
                    <dd className="text-right font-semibold">{h.listed <= 1 ? "Today" : `${h.listed} days ago`}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone">Reference</dt>
                    <dd className="text-right font-semibold tabular-nums">{ref}</dd>
                  </div>
                </dl>
                {h.deal === "buy" && (
                  <p className="mt-4 text-[12.5px] leading-snug text-stone">
                    Mortgage: borrowing {Math.round(maxLoanShare(h.price) * 100)}% over {YEARS} years at {RATE * 100}%. Your bank&apos;s offer will differ.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Viewing initial={h.id} />

      {similar.length > 0 && (
        <section className="bg-ivory px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(32px,3.4vw,52px)] leading-[1] font-semibold tracking-[-0.02em]">You might also like</h2>
              <a href={`/homes?deal=${h.deal}&community=${h.community}`} className="text-[15px] font-semibold text-gold-dark underline-offset-4 hover:underline">
                More in {c.name}
              </a>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((x) => (
                <HomeCard key={x.id} h={x} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer here={["viewing"]} />
    </>
  );
}
