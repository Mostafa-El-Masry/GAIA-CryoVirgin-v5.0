"use client";

import type { ReactNode } from "react";
import HealthShell from "./components/HealthShell";

export default function HealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <HealthShell>{children}</HealthShell>;
}
