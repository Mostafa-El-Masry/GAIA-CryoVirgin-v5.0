"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Intro v3.0 (Phase 5 Â· Week 1)
 * - Removes local/glass search (global search now lives in the Slim App Bar)
 * - Keeps 8 quick links (no /search)
 * - Mobile-first layout, centered symbol
 */
export default function Intro() {
  const left = [
    { href: "/apollo", label: "Apollo" },
    { href: "/timeline", label: "Timeline" },
    { href: "/health-awakening", label: "Health" },
    { href: "/ELEUTHIA", label: "ELEUTHIA" },
  ];
  const right = [
    { href: "/wealth-awakening", label: "Wealth" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/guardian", label: "Guardian" },
    { href: "/settings", label: "Settings" },
  ];
  const more = [{ href: "/instagram", label: "Instagram" }];
  const items = [...left, ...right, ...more];
  const linkNotes: Record<string, string> = {
    Apollo: "AI workspace and labs",
    Timeline: "Track recent sessions",
    Health: "Vitals and recovery",
    ELEUTHIA: "Creative vault and inspiration",
    Wealth: "Capital and flow",
    Dashboard: "Control room overview",
    Guardian: "Security and monitoring",
    Settings: "Themes and preferences",
    Instagram: "Social media integration",
  };

  const [radius, setRadius] = useState<number>(180);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setRadius(140);
      else if (w < 1024) setRadius(200);
      else setRadius(320);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(52,211,153,0.16),transparent_38%),radial-gradient(circle_at_50%_85%,rgba(52,211,153,0.12),transparent_45%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Mobile-first functions view */}
        <section className="mx-auto w-full max-w-xl space-y-4 md:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <img
                  src="/gaia-intro-1.png"
                  alt="GAIA"
                  className="h-9 w-auto"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                  GAIA
                </p>
                <p className="text-lg font-semibold leading-5 text-white">
                  Pick a function
                </p>
                <p className="text-sm text-white/70">
                  Built to be thumb-friendly on phones.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-white/15">
              Intro
            </span>
          </div>

          <div className="grid gap-3">
            {items.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className="gaia-glass gaia-border group flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 shadow-sm shadow-black/25 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:shadow-md hover:shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="text-xs text-emerald-50/80">
                      {linkNotes[item.label] ?? "Open module"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] text-emerald-100/90">
                  Tap
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="relative hidden h-[640px] sm:h-[720px] lg:h-[800px] md:block">
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <img src="/gaia-intro-1.png" alt="GAIA" className="h-96 w-auto" />
          </div>

          {(() => {
            const ringCount = items.length > 8 ? 2 : 1;
            const firstRingCount =
              ringCount === 2 ? Math.ceil(items.length / 2) : items.length;
            return items.map((l, i) => {
              const ringIndex = i < firstRingCount ? 0 : 1;
              const ringOffset = ringIndex === 0 ? 0 : firstRingCount;
              const ringSize =
                ringIndex === 0
                  ? firstRingCount
                  : items.length - firstRingCount;
              const angle = ((i - ringOffset) / ringSize) * 360;
              const ringRadius = ringIndex === 0 ? radius : radius + 160;
              const transform = `translate(-50%,-50%) rotate(${angle}deg) translate(0,-${ringRadius}px) rotate(-${angle}deg)`;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-label={l.label}
                  title={l.label}
                  className="gaia-glass gaia-border absolute left-1/2 top-1/2 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center backdrop-blur transition-transform transform-gpu hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaia-accent active:scale-[.99] text-[var(--gaia-text-default)] no-underline"
                  style={{ transform }}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                    <svg
                      className="h-4 w-4 text-[var(--gaia-text-muted)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        opacity="0.18"
                      />
                      <path
                        d="M8 12h8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium leading-tight sm:text-base">
                    {l.label}
                  </span>
                </Link>
              );
            });
          })()}
          {/* DEBUG: show computed items (remove after verification) */}
          <div className="pointer-events-none fixed right-4 bottom-4 z-50 hidden md:block">
            <div className="rounded bg-white/90 p-2 text-xs text-black/90 shadow">
              <strong className="block text-[11px]">
                Intro items ({items.length}):
              </strong>
              <div className="whitespace-pre">
                {items.map((it) => it.label).join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
