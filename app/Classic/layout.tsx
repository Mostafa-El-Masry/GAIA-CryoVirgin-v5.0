"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate permission="classic">
      <LessonGate featureLabel="Classic">{children}</LessonGate>
    </PermissionGate>
  );
}
