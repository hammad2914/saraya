"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type Option = { value: string; label: string; count?: number };

const PHONE = 640;

/**
 * A pill that opens a list: a popover under it on wide screens, a sheet from the
 * bottom on phones. Each option can show how many homes it would leave.
 * Keyboard: arrows to move, Enter to choose, Escape to close.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  active,
  align = "left",
}: {
  /** What the list is for ("Bedrooms"); heads the phone sheet and names the control. */
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  /** A filter is applied: the pill turns dark. */
  active: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  // Where the popover sits; null means the phone sheet.
  const [at, setAt] = useState<{ top: number; left?: number; right?: number; width: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  const show = () => {
    const r = btn.current!.getBoundingClientRect();
    setAt(
      window.innerWidth < PHONE
        ? null
        : { top: r.bottom + 8, width: r.width, ...(align === "right" ? { right: window.innerWidth - r.right } : { left: r.left }) },
    );
    setHi(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    btn.current?.focus();
  };
  const pick = (v: string) => {
    onChange(v);
    close();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    const sheet = window.innerWidth < PHONE;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    // A popover would drift from its pill as the page moves, so it closes instead.
    const moved = () => !sheet && setOpen(false);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", moved, { passive: true });
    window.addEventListener("resize", moved);
    // The sheet holds the page still behind it, like the phone menu.
    if (sheet) {
      document.documentElement.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("saraya:lock", { detail: true }));
    }
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", moved);
      window.removeEventListener("resize", moved);
      if (sheet) {
        document.documentElement.style.overflow = "";
        window.dispatchEvent(new CustomEvent("saraya:lock", { detail: false }));
      }
    };
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setHi(Math.min(last, hi + 1));
    else if (e.key === "ArrowUp") setHi(Math.max(0, hi - 1));
    else if (e.key === "Home") setHi(0);
    else if (e.key === "End") setHi(last);
    else if (e.key === "Enter" || e.key === " ") pick(options[hi].value);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") setOpen(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  const rows = (
    <ul
      ref={list}
      id={`${id}-list`}
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      aria-activedescendant={`${id}-${hi}`}
      onKeyDown={onKey}
      className="outline-none"
    >
      {options.map((o, i) => {
        const on = o.value === value;
        const empty = o.count === 0 && !on;
        return (
          <li
            key={o.value}
            id={`${id}-${i}`}
            role="option"
            aria-selected={on}
            onPointerEnter={() => setHi(i)}
            onClick={() => pick(o.value)}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 text-[14.5px] transition-colors max-sm:py-3.5 max-sm:text-[16px] sm:py-2.5 ${
              i === hi ? "bg-sand/70" : ""
            } ${on ? "font-semibold text-ink" : empty ? "text-ink/35" : "text-ink/80"}`}
          >
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            {o.count !== undefined && <span className="text-[13px] text-stone tabular-nums">{o.count}</span>}
            <Check className={`size-4 shrink-0 text-gold-dark ${on ? "" : "invisible"}`} strokeWidth={2.5} />
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            show();
          }
        }}
        className={`flex shrink-0 items-center gap-2 rounded-full py-2.5 pr-3.5 pl-4 text-[14px] font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          active ? "bg-ink text-ivory" : "bg-white text-ink/80 hover:text-ink"
        }`}
      >
        {current.label}
        <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""} ${active ? "text-ivory/70" : "text-stone"}`} />
      </button>

      {open && at && (
        <div
          ref={panel}
          data-lenis-prevent
          style={{ top: at.top, left: at.left, right: at.right, minWidth: Math.max(at.width, 230) }}
          className="fixed z-[60] max-h-[min(420px,60vh)] origin-top animate-[pop_.2s_var(--ease-out-soft)] overflow-y-auto rounded-[18px] bg-white p-1.5 shadow-[0_24px_60px_-20px_rgb(40_28_16/0.45),0_0_0_1px_rgb(40_28_16/0.06)]"
        >
          {rows}
        </div>
      )}

      {open && !at && (
        <>
          <div className="fixed inset-0 z-[60] animate-[fade_.25s_ease-out] bg-black/40" aria-hidden />
          <div
            ref={panel}
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[80svh] animate-[sheet_.35s_var(--ease-out-soft)] overflow-y-auto rounded-t-[26px] bg-white px-3 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/15" aria-hidden />
            <p className="px-3 pt-1 pb-2 text-[13px] font-bold tracking-[0.2em] text-stone">{label.toUpperCase()}</p>
            {rows}
          </div>
        </>
      )}
    </>
  );
}
