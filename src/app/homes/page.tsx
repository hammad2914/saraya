import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Market } from "@/components/market";

export const metadata: Metadata = {
  title: "Homes for sale and rent in Dubai | Saraya Estates",
  description: "Villas, townhouses, apartments and penthouses for sale, to rent and off-plan across Dubai, on a map.",
};

/** The filters come from the address (?deal=rent&community=palm), so they're read per request. */
async function FromQuery({ searchParams }: { searchParams: PageProps<"/homes">["searchParams"] }) {
  const q = await searchParams;
  const one = (k: string) => (typeof q[k] === "string" ? q[k] : undefined);
  return <Market initial={{ deal: one("deal"), community: one("community"), kind: one("kind"), beds: one("beds"), price: one("price"), sort: one("sort") }} />;
}

export default function HomesPage({ searchParams }: PageProps<"/homes">) {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="min-h-svh bg-[#f4eee5]" />}>
        <FromQuery searchParams={searchParams} />
      </Suspense>
      <Footer />
    </>
  );
}
