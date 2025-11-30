"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AcademyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/apollo/academy/Paths");
  }, [router]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-slate-800">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Apollo Academy
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold">
          The new Academy lives in Paths
        </h1>
        <p className="text-sm text-slate-600">
          You&apos;re being redirected to the Paths experience where study, quizzes, and progress now
          live. If you are not redirected automatically, use the link below.
        </p>
        <Link
          href="/apollo/academy/Paths"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Go to Paths
        </Link>
      </div>
    </main>
  );
}
