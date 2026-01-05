import Link from "next/link";
import SubjectsWrapper from "./components/SubjectsWrapper";

export default function ArchivesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Archives</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link
            href="/apollo/archives/Records/HTML"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-4 bg-white/90 shadow-sm text-3xl font-semibold text-slate-800 hover:bg-white"
          >
            HTML
          </Link>
          <Link
            href="/apollo/archives/Records/CSS"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-3xl font-semibold shadow-md hover:opacity-95"
          >
            CSS
          </Link>
        </div>
      </header>
      <SubjectsWrapper />
    </main>
  );
}
