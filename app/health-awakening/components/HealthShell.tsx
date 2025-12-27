"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { href: "/health-awakening", label: "Overview" },
  { href: "/health-awakening/food-calendar", label: "Food calendar", badge: "beta" },
  { href: "/health-awakening/training-calendar", label: "Training calendar", badge: "new" },
];

export default function HealthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className={`health-shell health-theme min-h-screen text-[var(--gaia-text-default)] ${manrope.className}`}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r gaia-border bg-[var(--gaia-surface)]/95 px-5 py-6 shadow-[6px_0_24px_rgba(15,23,42,0.08)] lg:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gaia-contrast-bg)]/20 text-lg font-bold text-[var(--gaia-contrast-bg)]">
              H
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] gaia-muted">
                Gaia Health
              </p>
              <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                Health Core
              </p>
            </div>
          </div>


          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--gaia-contrast-bg)]/15 text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-contrast-bg)]/60"
                      : "text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-[var(--gaia-surface-soft)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 text-[var(--gaia-text-default)]">
            <button className="w-full px-3 py-2 text-sm font-semibold text-[var(--gaia-text-strong)]">
              Start check-in
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
