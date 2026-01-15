"use client";

import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Protect dashboard with authentication check
  return <AuthGate>{children}</AuthGate>;
}
