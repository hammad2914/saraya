import { Buying } from "@/components/buying";
import { Communities } from "@/components/communities";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Homes } from "@/components/homes";
import { Viewing } from "@/components/viewing";
import { WindowHero } from "@/components/window-hero";

export default function Home() {
  return (
    <main>
      <Header />
      <WindowHero />
      <Communities />
      <Homes />
      <Buying />
      <Viewing />
      <Footer />
    </main>
  );
}
