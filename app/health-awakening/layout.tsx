"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";
import AuthGate from "@/components/AuthGate";
import HealthShell from "./components/HealthShell";

export default function HealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TEMP: bypass permission and lesson gates for review; set back to false after testing.
  const forceUnlock = true;

  if (forceUnlock) {
    return <AuthGate><HealthShell>{children}</HealthShell></AuthGate>;
  }

  return (
    <AuthGate>
      <PermissionGate permission="health">
        <LessonGate featureLabel="Health">
          <HealthShell>{children}</HealthShell>
        </LessonGate>
      </PermissionGate>
    </AuthGate>
  );
}
