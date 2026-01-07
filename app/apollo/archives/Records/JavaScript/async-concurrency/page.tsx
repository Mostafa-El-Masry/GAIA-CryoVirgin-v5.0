"use client";

export default function AsyncConcurrency() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Async & Concurrency</h1>
        <p className="mt-2 text-sm gaia-muted">
          Event loop, tasks, microtasks, promises, and concurrency primitives.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Event Loop</h2>
        <p className="text-sm">
          Call stack, task queue, microtask queue, rendering ticks.
        </p>

        <h2 className="text-lg font-semibold">Promises</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>States: pending, fulfilled, rejected</li>
          <li>Thenable resolution and chaining</li>
        </ul>
      </section>
    </main>
  );
}
