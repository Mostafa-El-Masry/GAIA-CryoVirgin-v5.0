"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { href: "/wealth-awakening", label: "Overview" },
  { href: "/wealth-awakening/accounts", label: "Accounts" },
  { href: "/wealth-awakening/flows", label: "Flows" },
  { href: "/wealth-awakening/instruments", label: "Instruments" },
  { href: "/wealth-awakening/levels", label: "Levels" },
  { href: "/wealth-awakening/projections", label: "Projections" },
  { href: "/wealth-awakening/status", label: "Status" },
];

const chipClass =
  "inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)]";

export default function WealthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-default)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r gaia-border bg-[var(--gaia-surface)]/95 px-5 py-6 shadow-[6px_0_30px_rgba(0,0,0,0.25)] lg:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gaia-contrast-bg)]/20 text-lg font-bold text-[var(--gaia-contrast-bg)]">
              G
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] gaia-muted">
                Gaia Wealth
              </p>
              <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                Wall Street Drive
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3">
            <div className="flex items-center justify-between text-xs gaia-muted">
              <span>Profile completeness</span>
              <span className="text-[var(--gaia-contrast-bg)]">20%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[var(--gaia-border)]">
              <div className="h-full w-1/5 rounded-full bg-[var(--gaia-contrast-bg)]" />
            </div>
            <Link
              href="/settings"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--gaia-contrast-bg)] px-3 py-2 text-[12px] font-semibold text-[var(--gaia-contrast-text)] transition hover:brightness-110"
            >
              Complete profile
            </Link>
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
            <button className="w-full rounded-lg bg-[var(--gaia-contrast-bg)] px-3 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] shadow-lg shadow-[var(--gaia-contrast-bg)]/25 transition hover:brightness-110">
              Deposit funds
            </button>
            <div className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3 text-xs gaia-muted">
              <p className="font-semibold text-[var(--gaia-text-strong)]">Switch to virtual</p>
              <p className="mt-1 text-[11px]">
                Keep experimenting without touching your real stash.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b gaia-border bg-[var(--gaia-surface)]/92 px-4 py-4 backdrop-blur lg:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={chipClass}>Live</span>
                <span className={chipClass}>Safe mode</span>
              </div>
              <div className="relative ml-auto flex-1 min-w-[220px] max-w-xl">
                <input
                  className="w-full rounded-lg border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)] placeholder:gaia-muted shadow-inner shadow-black/20 focus:border-[var(--gaia-contrast-bg)] focus:outline-none"
                  placeholder="Search wealth, flows, accounts"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-xs gaia-muted">
                  Ctrl+K
                </span>
              </div>
              <div className="flex items-center gap-3 gaia-muted">
                <span className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs">
                  Bell
                </span>
                <span className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-xs">
                  Help
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
