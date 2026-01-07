"use client";

export default function FunctionsScope() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Functions & Scope</h1>
        <p className="mt-2 text-sm gaia-muted">
          Function forms, arguments, scope, closures, and <code>this</code>.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Function Types</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Declarations, expressions, arrow functions, IIFE</li>
          <li>Arguments object, rest parameters, default params</li>
        </ul>

        <h2 className="text-lg font-semibold">Scope & Closures</h2>
        <p className="text-sm">
          Lexical scope, closure creation, private state, and common patterns.
        </p>
      </section>
    </main>
  );
}
