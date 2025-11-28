"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export default function WealthLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate permission="wealth">
      <LessonGate featureLabel="Wealth">
        <div className="mx-auto w-[80vw]">{children}</div>
      </LessonGate>
    </PermissionGate>
  );
}
