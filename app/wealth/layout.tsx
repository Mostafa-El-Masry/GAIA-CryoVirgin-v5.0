"use client";

import type { ReactNode } from "react";
import PermissionGate from "@/components/permissions/PermissionGate";

export default function WealthLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate permission="wealth">
      <div className="mx-auto w-[80vw]">{children}</div>
    </PermissionGate>
  );
}
