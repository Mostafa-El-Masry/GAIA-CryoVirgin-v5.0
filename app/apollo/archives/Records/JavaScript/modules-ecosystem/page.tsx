"use client";

export default function ModulesEcosystem() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Modules & Ecosystem</h1>
        <p className="mt-2 text-sm gaia-muted">
          ES modules, bundlers, package managers, and standards.
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Modules</h2>
        <p className="text-sm">
          Import/export, live bindings, top-level await, and module scope.
        </p>

        <h2 className="text-lg font-semibold">Tooling</h2>
        <p className="text-sm">
          npm/pnpm/yarn, bundlers like Vite/Webpack/Rollup, linters and testing
          tools.
        </p>
      </section>
    </main>
  );
}
