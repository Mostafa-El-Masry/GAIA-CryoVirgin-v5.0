"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import LessonGate from "@/components/permissions/LessonGate";

export const metadata = {
  title: "Health Awakening | GAIA",
};

export default function HealthAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PermissionGate permission="health">
      <LessonGate featureLabel="Health">{children}</LessonGate>
    </PermissionGate>
  );
}
