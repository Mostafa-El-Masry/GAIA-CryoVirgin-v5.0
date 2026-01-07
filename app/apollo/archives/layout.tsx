"use client";

import type { ReactNode } from "react";

export default function ArchivesLayout({ children }: { children: ReactNode }) {
  // Bypass gating so Archives are immediately accessible during review.
  return <>{children}</>;
}
