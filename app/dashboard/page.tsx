import Link from "next/link";
import DashboardWrapper from "./components/DashboardWrapper";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gaia-text-strong)]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm gaia-muted">
            Quick overview of your learning, builds, and safety.
          </p>
        </div>
        <Link
          href="/dashboard/calendars"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--gaia-text-default)] transition hover:bg-[var(--gaia-border)]/30"
        >
          Calendars hub
        </Link>
      </header>
      <DashboardWrapper />
    </main>
  );
}
