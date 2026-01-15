"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";
import AuthGate from "@/components/AuthGate";
import WealthShell from "./components/WealthShell";

export default function WealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TEMP: bypass permission and lesson gates for review; set back to false after testing.
  const forceUnlock = true;

  if (forceUnlock) {
    return <AuthGate><WealthShell>{children}</WealthShell></AuthGate>;
  }

  return (
    <AuthGate>
      <PermissionGate permission="wealth">
        <LessonGate featureLabel="Wealth Awakening">
          <WealthShell>{children}</WealthShell>
        </LessonGate>
      </PermissionGate>
    </AuthGate>
  );
}
