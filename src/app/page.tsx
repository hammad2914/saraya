import { Abroad } from "@/components/abroad";
import { AreaMatch } from "@/components/area-match";
import { Buying } from "@/components/buying";
import { Communities } from "@/components/communities";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Homes } from "@/components/homes";
import { Selling } from "@/components/selling";
import { SoundToggle } from "@/components/sound-toggle";
import { Viewing } from "@/components/viewing";
import { HOME_SECTIONS } from "@/lib/links";
import { WindowHero } from "@/components/window-hero";

export default function Home() {
  return (
    <main>
      <Header hero here={HOME_SECTIONS} />
      <WindowHero />
      <Communities />
      <AreaMatch />
      <Homes />
      <Buying />
      <Abroad />
      <Selling />
      <Viewing />
      <Footer here={HOME_SECTIONS} />
      <SoundToggle />
    </main>
  );
}
