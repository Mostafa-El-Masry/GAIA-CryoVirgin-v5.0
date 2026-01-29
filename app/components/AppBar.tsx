"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { capitalizeWords } from "@/lib/strings";

/**
 * Slim App Bar
 */
export default function AppBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const title = "User";
  const email: string | null = null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  useEffect(() => {
    try {
      const hideNav = pathname === "/";
      if (hideNav) {
        document.body.classList.remove("has-navbar");
        return;
      }
      document.body.classList.add("has-navbar");
      return () => {
        document.body.classList.remove("has-navbar");
      };
    } catch {
      // ignore DOM access errors outside the browser
    }
  }, [pathname]);

  return (
    <header className="gaia-glass-strong gaia-border fixed inset-x-0 top-0 z-50 border-b border backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-3 px-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gaia-intro.svg"
              onError={(event) => {
                const el = event.currentTarget as HTMLImageElement;
                el.src = "/gaia-intro.png";
              }}
              alt="GAIA"
              className="h-9 w-auto"
            />
            <span className="sr-only">GAIA Home</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-sm md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <form
            className="hidden md:block w-full max-w-lg"
            onSubmit={submitSearch}
            role="search"
          >
            <label htmlFor="gaia-search" className="sr-only">
              Search the site
            </label>
            <div className="relative">
              <input
                id="gaia-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search site..."
                className="w-full rounded-lg border gaia-border px-3 py-2 text-sm bg-white/6 placeholder:gaia-muted"
              />
            </div>
          </form>

          <div className="flex-shrink-0" />
        </div>

        {/* Mobile slide-down panel */}
        {mobileOpen && (
          <div className="md:hidden absolute inset-x-0 top-full z-40 gaia-glass gaia-border border-b p-3">
            <form onSubmit={submitSearch} role="search" className="mb-3">
              <label htmlFor="gaia-search-mobile" className="sr-only">
                Search the site
              </label>
              <input
                id="gaia-search-mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search site..."
                className="w-full rounded-lg border gaia-border px-3 py-2 text-sm bg-white/6 placeholder:gaia-muted"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
