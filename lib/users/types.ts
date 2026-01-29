// lib/users/types.ts
//
// GAIA Level 3 – Multi-user & Permissions (4.3 · Week 1)
// Core types for GAIA's internal user system.
//
// This does NOT replace Supabase auth. It is an app-level
// "profile / role / permissions" layer that can sit on top of
// any auth you use later.

export type GaiaUserRole = 'owner' | 'member' | 'guest';

export interface GaiaUserPermissions {
  canViewInstagramPrivate: boolean;
  canViewWealth: boolean;
  canViewHealth: boolean;
  canViewGuardian: boolean;
}

export interface GaiaUser {
  id: string;
  displayName: string;
  email: string | null;
  role: GaiaUserRole;
  permissions: GaiaUserPermissions;
  createdAt: string;
}
