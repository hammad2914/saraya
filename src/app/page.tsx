import { Buying } from "@/components/buying";
import { Communities } from "@/components/communities";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Homes } from "@/components/homes";
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
      <Homes />
      <Buying />
      <Viewing />
      <Footer here={HOME_SECTIONS} />
      <SoundToggle />
    </main>
  );
}
