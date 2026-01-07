import Link from "next/link";
import SubjectsWrapper from "./components/SubjectsWrapper";

export default function ArchivesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Archives</h1>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <Link
            href="/apollo/archives/Records/HTML"
            className="w-full flex items-center justify-between gap-4 rounded-lg px-6 py-6 bg-white/90 shadow-sm text-2xl font-semibold text-slate-800 hover:bg-white border border-slate-200"
          >
            <span className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-sky-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7v10M8 7v10M3 5h18v14H3z"
                />
              </svg>
              <span className="text-2xl">HTML</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href="/apollo/archives/Records/CSS"
            className="w-full flex items-center justify-between gap-4 rounded-lg px-6 py-6 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-2xl font-semibold shadow-md hover:opacity-95"
          >
            <span className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white/90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-2xl">CSS</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href="/apollo/archives/Records/JavaScript"
            className="w-full flex items-center justify-between gap-4 rounded-lg px-6 py-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-2xl font-semibold shadow-md hover:opacity-95"
          >
            <span className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white/90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v20M2 12h20"
                />
              </svg>
              <span className="text-2xl">JavaScript</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </header>
      <SubjectsWrapper />
    </main>
  );
}
