// using plain anchor tags for external static project links

import Link from "next/link";

export default function ApolloLabsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] gaia-muted">
          Apollo Labs
        </p>
        <h1 className="text-3xl font-semibold gaia-strong">
          Experiments & builds
        </h1>
        <p className="text-sm gaia-muted max-w-2xl">
          Labs now lives inside Apollo alongside Academy and Archives. Review
          your builds and open the experimental systems here.
        </p>
      </header>
      <section className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/JS-Projects/Counter-App/index.html"
            className="block"
            target="_blank"
            rel="noopener noreferrer"
          >
            <article className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-sm hover:shadow-md transition group">
              <div className="aspect-[16/9] bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-14 w-14 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v4m0 8v4M4 12h4m8 0h4"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-slate-300">
                    Counter App (Professional)
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-900">
                <h3 className="text-white font-semibold">
                  Counter App — Professional
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  A small system proving state, events, DOM, persistence and
                  history in vanilla JavaScript.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-amber-400">
                    JS Project
                  </span>
                  <span className="text-slate-400">Open project →</span>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </section>
    </main>
  );
}
