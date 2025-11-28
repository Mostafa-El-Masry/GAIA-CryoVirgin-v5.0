"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export const metadata = {
  title: "Wealth Awakening A� Wall Street Drive | GAIA",
};

export default function WealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PermissionGate permission="wealth">
      <LessonGate featureLabel="Wealth Awakening">
        <div className="mx-auto w-[80vw]">{children}</div>
      </LessonGate>
    </PermissionGate>
  );
}
