"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export default function ApolloLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate permission="apollo">
      <LessonGate featureLabel="Apollo">{children}</LessonGate>
    </PermissionGate>
  );
}
