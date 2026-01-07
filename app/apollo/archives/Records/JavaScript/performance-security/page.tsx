"use client";

export default function PerformanceSecurity() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Performance & Security</h1>
        <p className="mt-2 text-sm gaia-muted">
          Optimization techniques and common security considerations.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Performance</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Hot paths, memoization, hidden classes, inline caching</li>
          <li>Debounce/throttle, lazy loading</li>
        </ul>

        <h2 className="text-lg font-semibold">Security</h2>
        <p className="text-sm">
          XSS, CSRF, same-origin policy, and safe use of eval/third-party code.
        </p>
      </section>
    </main>
  );
}
