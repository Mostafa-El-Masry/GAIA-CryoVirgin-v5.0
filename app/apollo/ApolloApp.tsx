"use client";

import AskPanel from "./components/AskPanel";
import LinkCard from "./components/LinkCard";
import ApolloStudyGate from "./components/ApolloStudyGate";
import PermissionGate from "@/components/permissions/PermissionGate";

export default function ApolloApp() {
  return (
    <main className="min-h-screen gaia-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] gaia-muted">
            Apollo
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold gaia-strong">
            Ask ChatGPT · Capture the best bits into your archive
          </h1>
          <p className="max-w-3xl text-sm sm:text-base gaia-muted">
            Use this space to ask focused questions about what you&apos;re
            learning. When you get a good answer, select the useful parts and
            append them to your Apollo notes. Academy now handles topics and
            sections — this page is just your assistant surface.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LinkCard
            href="/apollo/academy"
            title="Academy"
            description="Browse topics and structured lessons to level up."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20l8-4V6l-8 4-8-4v10l8 4z"
                />
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 12v8"
                />
              </svg>
            }
          />

          <PermissionGate permission="archives" fallback={null}>
            <ApolloStudyGate
              featureLabel="Archives"
              fallback={
                <div className="gaia-panel gaia-border rounded-xl border p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
                    Locked
                  </p>
                  <h3 className="mt-1 text-lg font-semibold gaia-strong">
                    Archives unlock after 3 lessons.
                  </h3>
                  <p className="text-sm gaia-muted">
                    Finish a few Academy lessons to save notes and transcripts here.
                  </p>
                  <a
                    href="/apollo/academy"
                    className="mt-3 inline-flex items-center rounded-lg gaia-contrast px-3 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                  >
                    Go to Academy
                  </a>
                </div>
              }
            >
              <LinkCard
                href="/apollo/archives"
                title="Archives"
                description="Your saved notes and useful answers from Apollo."
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="4"
                      rx="1"
                      ry="1"
                      strokeWidth="1.5"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 12h4"
                    />
                  </svg>
                }
              />
            </ApolloStudyGate>
          </PermissionGate>

          <PermissionGate permission="labs" fallback={null}>
            <ApolloStudyGate
              featureLabel="Labs"
              fallback={
                <div className="gaia-panel gaia-border rounded-xl border p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
                    Locked
                  </p>
                  <h3 className="mt-1 text-lg font-semibold gaia-strong">
                    Labs unlock after 3 lessons.
                  </h3>
                  <p className="text-sm gaia-muted">
                    Ship a few Academy lessons first, then you can build and archive experiments.
                  </p>
                  <a
                    href="/apollo/academy"
                    className="mt-3 inline-flex items-center rounded-lg gaia-contrast px-3 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                  >
                    Go to Academy
                  </a>
                </div>
              }
            >
              <LinkCard
                href="/apollo/labs"
                title="Labs"
                description="Experiments and prototyping space for ideas."
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 13v3a4 4 0 0 0 8 0v-3"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8h6l1 3H8l1-3z"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v5"
                    />
                  </svg>
                }
              />
            </ApolloStudyGate>
          </PermissionGate>
        </section>

        <PermissionGate permission="apollo" fallback={null}>
          <ApolloStudyGate featureLabel="Ask ChatGPT">
            <section className="rounded-3xl gaia-panel-soft p-4 sm:p-6 shadow-sm">
              <AskPanel />
            </section>
          </ApolloStudyGate>
        </PermissionGate>
      </div>
    </main>
  );
}
