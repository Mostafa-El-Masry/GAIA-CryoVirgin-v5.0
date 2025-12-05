import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";
import WealthShell from "./components/WealthShell";

export const metadata = {
  title: "Wealth Awakening - Wall Street Drive | GAIA",
};

export default function WealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TEMP: bypass permission and lesson gates for review; set back to false after testing.
  const forceUnlock = true;

  if (forceUnlock) {
    return <WealthShell>{children}</WealthShell>;
  }

  return (
    <PermissionGate permission="wealth">
      <LessonGate featureLabel="Wealth Awakening">
        <WealthShell>{children}</WealthShell>
      </LessonGate>
    </PermissionGate>
  );
}
