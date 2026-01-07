"use client";

export default function ObjectsPrototypes() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Objects & Prototypes</h1>
        <p className="mt-2 text-sm gaia-muted">
          Object internals, prototype chain, and classes.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Object Internals</h2>
        <p className="text-sm">
          Property descriptors, enumerable vs non-enumerable, and internal
          slots.
        </p>

        <h2 className="text-lg font-semibold">Prototype Chain</h2>
        <p className="text-sm">
          Lookup semantics, shadowing, and performance considerations.
        </p>

        <h2 className="text-lg font-semibold">Classes</h2>
        <p className="text-sm">
          Syntactic sugar over prototypes, constructors, static methods, and
          private fields.
        </p>
      </section>
    </main>
  );
}
