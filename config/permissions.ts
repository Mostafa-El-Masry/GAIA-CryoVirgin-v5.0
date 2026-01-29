export type PermissionKey =
  | "gallery"
  | "apollo"
  | "eleuthia"
  | "timeline"
  | "health"
  | "wealth"
  | "dashboard"
  | "settings"
  | "classic"
  | "locked"
  | "guardian"
  | "archives"
  | "core"
  | "labs"
  | "settingsAppearance"
  | "settingsGallery"
  | "instagram";

export type PermissionSet = Record<PermissionKey, boolean>;

export const PERMISSION_STORAGE_KEY = "user_permissions";

export function getCreatorAdminEmail(): string | null {
  // TODO: Implement actual admin email retrieval
  return null;
}

export function createEmptyPermissionSet(): PermissionSet {
  return {
    gallery: false,
    apollo: false,
    eleuthia: false,
    timeline: false,
    health: false,
    wealth: false,
    dashboard: false,
    settings: false,
    classic: false,
    locked: false,
    guardian: false,
    archives: false,
    core: false,
    labs: false,
    settingsAppearance: false,
    settingsGallery: false,
    instagram: false,
  };
}

export function createAdminPermissionSet(): PermissionSet {
  return {
    gallery: true,
    apollo: true,
    eleuthia: true,
    timeline: true,
    health: true,
    wealth: true,
    dashboard: true,
    settings: true,
    classic: true,
    locked: true,
    guardian: true,
    archives: true,
    core: true,
    labs: true,
    settingsAppearance: true,
    settingsGallery: true,
    instagram: true,
  };
}

export function ensurePermissionShape(
  permissions: Partial<PermissionSet> | null,
): PermissionSet {
  const defaults: PermissionSet = {
    gallery: false,
    apollo: false,
    eleuthia: false,
    timeline: false,
    health: false,
    wealth: false,
    dashboard: false,
    settings: false,
    classic: false,
    locked: false,
    guardian: false,
    archives: false,
    core: false,
    labs: false,
    settingsAppearance: false,
    settingsGallery: false,
    instagram: false,
  };

  if (!permissions || typeof permissions !== "object") {
    return defaults;
  }

  // Merge provided permissions with defaults, only keeping valid keys
  const result: PermissionSet = { ...defaults };
  for (const key of Object.keys(permissions)) {
    if (key in defaults) {
      result[key as PermissionKey] = Boolean(permissions[key as PermissionKey]);
    }
  }

  return result;
}

export function getAvailablePermissionKeys(): PermissionKey[] {
  return [
    "gallery",
    "apollo",
    "eleuthia",
    "timeline",
    "health",
    "wealth",
    "dashboard",
    "settings",
    "classic",
    "locked",
    "guardian",
    "archives",
    "core",
    "labs",
    "settingsAppearance",
    "settingsGallery",
    "instagram",
  ];
}

export function saveUserPermissionSet(
  payload: { userId: string; permissions: PermissionSet }
): Promise<void> {
  // TODO: Implement actual permission saving
  return Promise.resolve();
}
