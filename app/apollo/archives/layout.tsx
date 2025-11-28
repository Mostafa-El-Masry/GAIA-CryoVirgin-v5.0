"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";
import ApolloStudyGate from "../components/ApolloStudyGate";

export default function ArchivesLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate permission="archives">
      <ApolloStudyGate featureLabel="Archives">{children}</ApolloStudyGate>
    </PermissionGate>
  );
}
