import Link from "next/link";
import SubjectsWrapper from "./components/SubjectsWrapper";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartAddIcon,
  Briefcase02Icon,
  GameController02Icon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";

export default function ArchivesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Archives</h1>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <a
              className="group block w-full rounded-lg bg-slate-50 p-4 shadow hover:shadow-md flex items-center gap-3"
              href="/apollo/archives/Records/HTML"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7l-4 5 4 5"
                  />
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7l4 5-4 5"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">HTML</h3>
                <p className="text-sm text-slate-500">
                  Markup fundamentals and patterns
                </p>
              </div>
            </a>

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

            <Link
              href="/apollo/archives/Records/JavaScript/projects"
              className="w-full flex items-center justify-between gap-4 rounded-lg px-6 py-6 bg-white/90 shadow-sm text-2xl font-semibold text-slate-800 hover:bg-white border border-slate-200"
            >
              <span className="flex items-center gap-3">
                <div className="h-7 w-7 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 3h6v4H9z"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 11h10M7 15h6"
                    />
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19l2 2 4-4"
                    />
                  </svg>
                </div>
                <span className="text-2xl">JS Projects</span>
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
          </div>
        </div>
      </header>
    </main>
  );
}
