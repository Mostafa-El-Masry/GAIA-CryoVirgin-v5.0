export type GaiaUserRole = "owner" | "member" | "guest";

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
