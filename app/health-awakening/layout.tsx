import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";
import HealthShell from "./components/HealthShell";

export const metadata = {
  title: "Health Awakening | GAIA",
};

export default function HealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TEMP: bypass permission and lesson gates for review; set back to false after testing.
  const forceUnlock = true;

  if (forceUnlock) {
    return <HealthShell>{children}</HealthShell>;
  }

  return (
    <PermissionGate permission="health">
      <LessonGate featureLabel="Health">
        <HealthShell>{children}</HealthShell>
      </LessonGate>
    </PermissionGate>
  );
}
