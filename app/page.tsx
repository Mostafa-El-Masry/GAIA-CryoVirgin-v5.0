"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import NoScroll from "@/components/NoScroll";
import UserDropdown from "@/components/UserDropdown";
import { useAuthSnapshot } from "@/lib/auth-client";
import { isCreatorAdmin, useCurrentPermissions } from "@/lib/permissions";
import type { PermissionKey } from "@/config/permissions";

interface NavLink {
  href: string;
  label: string;
  permission: PermissionKey;
}

/**
 * New GAIA Home (v2.0)
 * - Circular layout with links around central symbol
 * - Responsive radius based on viewport
 */
export default function HomePage() {
  const [radius] = useState<number>(280);
  const [mobileOpen, setMobileOpen] = useState(true);
  const { profile, status } = useAuthSnapshot();
  const email = profile?.email ?? status?.email ?? null;
  const permissions = useCurrentPermissions();
  const isAdmin = useMemo(() => isCreatorAdmin(email), [email]);

  const linkNotes: Record<string, string> = {
    Gallery: "Story vault and media drops",
    Apollo: "AI workspace and tools",
    ELEUTHIA: "Guided creation studio",
    Timeline: "Session log and notes",
    Health: "Vitals and recovery",
    Wealth: "Capital dashboards",
    Accounts: "Profiles and access",
    Dashboard: "Control room overview",
    Settings: "Preferences and themes",
  };

  // All links in one array for circular layout
  const links: NavLink[] = [
    { href: "/gallery-awakening", label: "Gallery", permission: "gallery" },
    { href: "/apollo", label: "Apollo", permission: "apollo" },
    { href: "/ELEUTHIA", label: "ELEUTHIA", permission: "eleuthia" },
    { href: "/timeline", label: "Timeline", permission: "timeline" },
    { href: "/health-awakening", label: "Health", permission: "health" },
    { href: "/wealth-awakening", label: "Wealth", permission: "wealth" },
    { href: "/accounts", label: "Accounts", permission: "accounts" }, // <-- new
    { href: "/dashboard", label: "Dashboard", permission: "dashboard" },
    // Archives moved under Apollo; remove from main intro links
    { href: "/settings", label: "Settings", permission: "settings" },
  ];

  const { isFeatureUnlocked } = useGaiaFeatureUnlocks();

  const visibleLinks = isAdmin
    ? links
    : links.filter((link) => {
        if (!permissions[link.permission]) return false;

        // Dashboard + Apollo are always available (once permissioned)
        if (link.href === "/dashboard" || link.href === "/apollo") {
          return true;
        }

        // Feature-by-feature Academy unlocks
        switch (link.href) {
          case "/wealth-awakening":
            return isFeatureUnlocked("wealth");
          case "/health-awakening":
            return isFeatureUnlocked("health");
          case "/timeline":
            return isFeatureUnlocked("timeline");
          case "/accounts":
            return isFeatureUnlocked("accounts");
          case "/ELEUTHIA":
            return isFeatureUnlocked("eleuthia");
          case "/settings":
            return isFeatureUnlocked("settings");
          case "/gallery-awakening":
            return isFeatureUnlocked("gallery");
          default:
            return true;
        }
      });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden text-[var(--gaia-text-default)]">
      <NoScroll />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--gaia-ink-faint),transparent_45%),radial-gradient(circle_at_80%_0%,var(--gaia-ink-faint),transparent_55%),radial-gradient(circle_at_50%_85%,var(--gaia-ink-faint),transparent_60%)]" />

      <div className="absolute right-6 top-6 z-50 hidden md:block">
        <UserDropdown />
      </div>

      {/* Mobile layout */}
      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pt-8 pb-12 md:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gaia-ink-soft)] ring-1 ring-[var(--gaia-border)]">
              <img src="/gaia-intro-1.png" alt="GAIA" className="h-9 w-auto" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--gaia-text-muted)]">
                GAIA
              </p>
              <p className="text-base font-semibold leading-5 text-[var(--gaia-text-strong)]">
                Adaptive navigator
              </p>
              <p className="text-[11px] text-[var(--gaia-text-muted)]">
                {email ? `Signed in as ${email}` : "Guest session active"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-strong)] shadow-inner shadow-black/5 transition hover:border-[var(--gaia-contrast-bg)]"
            aria-label={mobileOpen ? "Hide functions" : "Show functions"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 transition-transform ${
                mobileOpen ? "rotate-45" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M5 12h14M12 5v14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-5 shadow-xl shadow-black/5">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
              Continue your session
            </p>
            <p className="text-sm text-[var(--gaia-text-muted)]">
              Jump into a function or keep exploring. Everything is tuned for
              one-hand navigation.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {visibleLinks.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="gaia-panel group flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--gaia-text-strong)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--gaia-contrast-bg)]/30 hover:shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--gaia-ink-soft)] text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-border)]">
                  {link.label.slice(0, 1)}
                </span>
                <span className="leading-tight">{link.label}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="mt-4 w-full rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-3 text-sm font-medium text-[var(--gaia-text-strong)] transition hover:border-[var(--gaia-contrast-bg)]/30"
          >
            {mobileOpen ? "Hide full function list" : "Show full function list"}
          </button>
        </div>

        <div
          className={`grid gap-3 transition duration-200 ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {visibleLinks.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              className="gaia-panel group flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:border-[var(--gaia-contrast-bg)]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gaia-ink-soft)] text-sm font-semibold text-[var(--gaia-text-strong)] ring-1 ring-[var(--gaia-border)]">
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-[var(--gaia-text-strong)]">
                    {link.label}
                  </span>
                  <span className="text-xs text-[var(--gaia-text-muted)]">
                    {linkNotes[link.label] ?? "Open module"}
                  </span>
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--gaia-text-muted)]">
                Tap
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Circle Container (desktop/tablet) */}
        <div className="relative hidden h-[640px] sm:h-[720px] lg:h-[800px] md:block">
          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <img src="/gaia-intro-1.png" alt="GAIA" className="h-96 w-auto" />
          </div>

          {/* Links positioned in a circle */}
          {visibleLinks.map((link: NavLink, i: number) => {
            const angle = i * (360 / visibleLinks.length) * (Math.PI / 180);

            const rawX = radius * Math.cos(angle);
            const rawY = radius * Math.sin(angle);
            const x = rawX.toFixed(3);
            const y = rawY.toFixed(3);
            const style = {
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            };

            return (
              <Link
                key={link.href}
                href={link.href}
                className="gaia-panel octagon-link absolute left-1/2 top-1/2 flex w-32 items-center justify-center px-6 py-3 text-center text-lg font-medium text-[var(--gaia-text-strong)] backdrop-blur transition whitespace-nowrap"
                style={style}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
