"use client";

import React from "react";
import { useActiveUser } from "@/lib/users/client";

type PermissionKey = "instagramPrivate" | "wealth" | "health" | "guardian";

interface PermissionGateProps {
  require?: PermissionKey[];
  allowOwnerOverride?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// GAIA Level 3 – Multi-user & Permissions
// Version 4.3 · Week 3
//
// PermissionGate
// --------------
// Client-side gate that checks the current GAIA user (from localStorage + Supabase)
// and decides whether to show children or a "locked" placeholder.
//
// Use it in any page or component like:
//
//   <PermissionGate require={['wealth']}>
//     <WealthContent />
//   </PermissionGate>
//
// For guests (role = 'guest') you can set all module permissions to false so they
// only see the intro page (where you do not wrap with PermissionGate).

const DefaultLockedFallback = () => (
  <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-black/60 px-4 py-6 text-center text-[11px] text-zinc-400">
    <p className="font-medium text-zinc-200">
      This area is locked for this GAIA user.
    </p>
    <p className="mt-1 text-[10px] text-zinc-500">
      Switch to another user or update permissions in Settings → Users &amp;
      Permissions.
    </p>
  </div>
);

function hasPermission(
  key: PermissionKey,
  user: ReturnType<typeof useActiveUser>["user"],
): boolean {
  if (!user) return false;
  const p = user.permissions;
  if (!p) return false;
  if (key === "instagramPrivate") return !!p.canViewInstagramPrivate;
  if (key === "wealth") return !!p.canViewWealth;
  if (key === "health") return !!p.canViewHealth;
  if (key === "guardian") return !!p.canViewGuardian;
  return false;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  require = [],
  allowOwnerOverride = true,
  fallback,
  children,
}) => {
  const state = useActiveUser();
  const { user, loading } = state;

  // While loading, you can either show nothing or a very light skeleton.
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-900 bg-black/40 px-4 py-6 text-[11px] text-zinc-500">
        Checking permissions…
      </div>
    );
  }

  if (!user) {
    // No active user selected → treat as not allowed for now.
    return <>{fallback ?? <DefaultLockedFallback />}</>;
  }

  if (allowOwnerOverride && user.role === "owner") {
    return <>{children}</>;
  }

  const requiredKeys = require ?? [];
  if (requiredKeys.length === 0) {
    // No explicit requirements → always allow.
    return <>{children}</>;
  }

  const allowed = requiredKeys.every((key) => hasPermission(key, user));
  if (!allowed) {
    return <>{fallback ?? <DefaultLockedFallback />}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
