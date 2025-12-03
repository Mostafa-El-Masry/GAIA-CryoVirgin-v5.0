"use client";

import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
};

export default function LinkCard({ href, title, description, icon }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-slate-900 transition"
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="text-xs text-slate-600 max-w-xs mt-1 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
