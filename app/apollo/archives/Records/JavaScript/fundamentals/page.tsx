"use client";

export default function Fundamentals() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Fundamentals</h1>
        <p className="mt-2 text-sm gaia-muted">
          Syntax, types, and variable declarations.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Syntax & Statements</h2>
        <p className="text-sm">
          Statements perform actions; expressions produce values.
        </p>

        <h2 className="text-lg font-semibold">Types</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>
            Primitive types: string, number, bigint, boolean, undefined, null,
            symbol
          </li>
          <li>Reference types: Object, Array, Function, Date, Map/Set</li>
        </ul>

        <h2 className="text-lg font-semibold">Variables</h2>
        <p className="text-sm">
          Use <code>let</code> and <code>const</code> instead of{" "}
          <code>var</code>. Beware the temporal dead zone.
        </p>
      </section>
    </main>
  );
}
