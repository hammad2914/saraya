"use client";

import { useEffect, useRef, useState } from "react";

const TRACK = "/audio/hero.mp3"; // the music from the reference video, looped
const LEVEL = 0.55;

/**
 * Music is off until asked for (browsers block sound that starts by itself).
 * Turning it on or off fades the volume rather than cutting it.
 */
export function SoundToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const [on, setOn] = useState(false);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    audio.current?.pause();
  }, []);

  const fade = (a: HTMLAudioElement, to: number, done?: () => void) => {
    cancelAnimationFrame(raf.current);
    const from = a.volume;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      a.volume = from + (to - from) * k;
      if (k < 1) raf.current = requestAnimationFrame(step);
      else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };

  const toggle = () => {
    if (!audio.current) {
      audio.current = new Audio(TRACK);
      audio.current.loop = true;
      audio.current.volume = 0;
    }
    const a = audio.current;
    if (on) {
      setOn(false);
      fade(a, 0, () => a.pause());
    } else {
      setOn(true);
      a.play().then(() => fade(a, LEVEL)).catch(() => setOn(false));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      className="fixed right-5 bottom-5 z-40 flex h-11 items-center gap-2.5 rounded-full bg-ink/85 pr-4 pl-3.5 text-[12.5px] font-bold tracking-[0.14em] text-ivory shadow-[0_12px_30px_-12px_rgb(0_0_0/0.6)] transition hover:bg-ink md:right-8 md:bottom-8"
    >
      <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * -0.23}s`, animationDuration: `${0.8 + (i % 2) * 0.25}s` }}
            className={`w-[2.5px] origin-bottom rounded-full bg-gold transition-[height] duration-300 ${on ? "h-full animate-[eq_ease-in-out_infinite]" : "h-[3px]"}`}
          />
        ))}
      </span>
      {on ? "SOUND ON" : "SOUND"}
    </button>
  );
}
