"use client";

export default function PhilosophyPatterns() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Philosophy & Patterns</h1>
        <p className="mt-2 text-sm gaia-muted">
          Design patterns, anti-patterns, and JavaScript philosophy.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Design Patterns</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Module, Factory, Observer, Singleton, Functional composition</li>
        </ul>

        <h2 className="text-lg font-semibold">Anti-Patterns</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>
            Implicit globals, overusing mutation, callback hell, leaky
            abstractions
          </li>
        </ul>
      </section>
    </main>
  );
}
