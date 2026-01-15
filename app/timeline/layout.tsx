"use client";

import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export default function TimelineLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <PermissionGate permission="timeline">
        <LessonGate featureLabel="Timeline">{children}</LessonGate>
      </PermissionGate>
    </AuthGate>
  );
}
