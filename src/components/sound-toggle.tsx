"use client";

import { useEffect, useRef, useState } from "react";

const TRACK = "/audio/hero.mp3"; // the music from the reference video, looped
const LEVEL = 0.55;

/**
 * The hero's music. It is on by default but only plays while the window scene
 * is on screen: it fades out as you scroll past and back in when you return.
 * Browsers block sound until the visitor first clicks, taps or presses a key,
 * so if starting straight away fails, it starts on that first gesture.
 */
export function SoundToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);
  const want = useRef(true);
  const inHero = useRef(true);
  const [on, setOn] = useState(true);
  // Playing: sound is coming out. Blocked: the browser is waiting for a gesture.
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [shown, setShown] = useState(true);

  const fade = (a: HTMLAudioElement, to: number, done?: () => void) => {
    cancelAnimationFrame(raf.current);
    const from = a.volume;
    const start = performance.now();
    const step = (t: number) => {
      // A frame can be stamped just before start; keep k in 0..1 or the volume goes negative and throws.
      const k = Math.min(1, Math.max(0, (t - start) / 900));
      a.volume = from + (to - from) * k;
      if (k < 1) raf.current = requestAnimationFrame(step);
      else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };

  /** Play or fade out, to match what the visitor wants and where they are on the page. */
  const sync = () => {
    if (!audio.current) {
      audio.current = new Audio(TRACK);
      audio.current.loop = true;
      audio.current.volume = 0;
    }
    const a = audio.current;
    if (want.current && inHero.current) {
      a.play()
        .then(() => {
          setBlocked(false);
          setPlaying(true);
          fade(a, LEVEL);
        })
        .catch(() => setBlocked(true));
    } else {
      setPlaying(false);
      fade(a, 0, () => a.pause());
    }
  };

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    // The window scene counts as on screen until its bottom passes the middle of the view.
    const onScroll = () => {
      const now = hero ? hero.getBoundingClientRect().bottom > window.innerHeight * 0.5 : false;
      if (now === inHero.current) return;
      inHero.current = now;
      setShown(now);
      sync();
    };
    // Any first click, tap or key press unlocks sound in the browser.
    const unlock = (e: Event) => {
      // The button handles its own taps.
      if (btn.current?.contains(e.target as Node)) return;
      if (want.current && inHero.current && audio.current?.paused !== false) sync();
    };
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    onScroll();
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    gestures.forEach((g) => window.addEventListener(g, unlock, { passive: true }));
    return () => {
      window.removeEventListener("scroll", onScroll);
      gestures.forEach((g) => window.removeEventListener(g, unlock));
      cancelAnimationFrame(raf.current);
      audio.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set up once
  }, []);

  const toggle = () => {
    // Waiting for a gesture: this tap is it, so start rather than switch off.
    if (on && blocked) return sync();
    want.current = !on;
    setOn(!on);
    sync();
  };

  const sounding = on && playing;
  return (
    <button
      ref={btn}
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      tabIndex={shown ? 0 : -1}
      className={`fixed right-5 bottom-5 z-40 flex h-11 items-center gap-2.5 rounded-full bg-ink/85 pr-4 pl-3.5 text-[12.5px] font-bold tracking-[0.14em] text-ivory shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] transition duration-500 hover:bg-ink md:right-8 md:bottom-8 ${
        shown ? "" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * -0.23}s`, animationDuration: `${0.8 + (i % 2) * 0.25}s` }}
            className={`w-[2.5px] origin-bottom rounded-full bg-gold transition-[height] duration-300 ${sounding ? "h-full animate-[eq_ease-in-out_infinite]" : "h-[3px]"}`}
          />
        ))}
      </span>
      {!on ? "SOUND OFF" : blocked ? "TAP FOR SOUND" : "SOUND ON"}
    </button>
  );
}
