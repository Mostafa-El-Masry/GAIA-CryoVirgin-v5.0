"use client";

import type { ReactNode } from "react";
import WealthShell from "./components/WealthShell";

export default function WealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <WealthShell>{children}</WealthShell>;
}
