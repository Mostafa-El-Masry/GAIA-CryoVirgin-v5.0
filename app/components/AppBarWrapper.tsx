"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AppBarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideAppBar = pathname === "/";
  if (hideAppBar) return null;
  return <>{children}</>;
}
