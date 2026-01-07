"use client";

export default function RuntimePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Runtime & Engines</h1>
        <p className="mt-2 text-sm gaia-muted">
          JavaScript engine architecture, execution contexts, and memory.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Engine Architecture</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Parser / AST</li>
          <li>Interpreter / JIT</li>
          <li>Optimizer and garbage collector</li>
        </ul>

        <h2 className="text-lg font-semibold">Execution Contexts</h2>
        <p className="text-sm">
          Global, function, and eval contexts; lexical and variable
          environments; <code>this</code> binding.
        </p>

        <h2 className="text-lg font-semibold">Memory Model</h2>
        <p className="text-sm">
          Stack for primitives and contexts; heap for objects and closures.
        </p>
      </section>
    </main>
  );
}
