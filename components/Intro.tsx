"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Clock,
  Heart,
  Lightbulb,
  TrendingUp,
  LayoutDashboard,
  Shield,
  Settings,
  Instagram,
} from "lucide-react";

/**
 * Intro v3.0 (Phase 5 Â· Week 1)
 * - Removes local/glass search (global search now lives in the Slim App Bar)
 * - Keeps 8 quick links (no /search)
 * - Mobile-first layout, centered symbol
 */
export default function Intro() {
  const left = [
    { href: "/apollo", label: "Apollo", icon: Sparkles },
    { href: "/timeline", label: "Timeline", icon: Clock },
    { href: "/health-awakening", label: "Health", icon: Heart },
    { href: "/ELEUTHIA", label: "ELEUTHIA", icon: Lightbulb },
  ];
  const right = [
    { href: "/wealth-awakening", label: "Wealth", icon: TrendingUp },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/guardian", label: "Guardian", icon: Shield },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  const more = [{ href: "/instagram", label: "Instagram", icon: Instagram }];
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
        {/* Mobile-first circular view */}
        <section className="mx-auto w-full space-y-4 md:hidden">
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur">
                <img
                  src="/gaia-intro-1.png"
                  alt="GAIA"
                  className="h-20 w-auto"
                />
              </div>
              <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-emerald-200">
                GAIA
              </p>
            </div>

            {/* Circular grid layout */}
            <div className="relative h-96 w-full max-w-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                {items.map((l, i) => {
                  const IconComponent = l.icon;
                  const angle = (i / items.length) * 360;
                  const radius = 140;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  const transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="gaia-glass gaia-border group absolute left-1/2 top-1/2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-4 shadow-sm shadow-black/25 backdrop-blur transition hover:scale-110 hover:shadow-md hover:shadow-emerald-500/20 focus:outline-none"
                      style={{ transform }}
                    >
                      <IconComponent size={24} className="text-emerald-300" />
                      <span className="text-xs font-semibold text-white text-center leading-tight">
                        {l.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
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
              const IconComponent = l.icon;
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
                  className="gaia-glass gaia-border absolute left-1/2 top-1/2 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center backdrop-blur transition-transform transform-gpu hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaia-accent active:scale-[.99] text-[var(--gaia-text-default)] no-underline"
                  style={{ transform }}
                >
                  <IconComponent
                    size={20}
                    className="shrink-0 text-emerald-300"
                  />
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
