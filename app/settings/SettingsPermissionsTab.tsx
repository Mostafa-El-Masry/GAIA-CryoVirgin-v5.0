"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PermissionKey, PermissionSet } from "@/config/permissions";
import {
  getAvailablePermissionKeys,
  saveUserPermissionSet,
} from "@/lib/permissions";

type UserSummary = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastSignInAt: string | null;
  permissions: PermissionSet;
};

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

const FRIENDLY_LABELS: Partial<Record<PermissionKey, string>> = {
  apollo: "Apollo",
  archives: "Archives",
  classic: "Classic GAIA",
  core: "Core brain",
  dashboard: "Dashboard",
  eleuthia: "ELEUTHIA",
  instagram: "Instagram",
  health: "Health",
  labs: "Labs",
  locked: "Locked sections",
  timeline: "Timeline",
  wealth: "Wealth",
  settings: "Settings (all)",
  settingsAppearance: "Settings · Appearance",
  settingsInstagram: "Settings · Instagram",
};

function labelForPermission(key: PermissionKey): string {
  const friendly = FRIENDLY_LABELS[key];
  if (friendly) return friendly;
  // Fallback: capitalise key
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function userDisplayName(user: UserSummary): string {
  if (user.name && user.name.trim()) return user.name.trim();
  if (user.email) return user.email.split("@")[0] || user.email;
  return "Unknown user";
}

const SettingsPermissionsTab: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] =
    useState<PermissionSet | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const permissionKeys = useMemo(() => getAvailablePermissionKeys(), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState({ status: "loading" });
      setSaveMessage(null);
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) {
          let message = `Unable to load users (status ${res.status}).`;
          try {
            const body = await res.json();
            if (typeof body?.error === "string") {
              message = body.error;
            }
          } catch {
            // ignore JSON parse failures
          }
          if (!cancelled) {
            setLoadState({ status: "error", message });
          }
          return;
        }

        const data = (await res.json()) as { users?: UserSummary[] };
        const list = Array.isArray(data.users) ? data.users : [];
        if (!cancelled) {
          setUsers(list);
          if (list.length > 0) {
            const first = list[0];
            setSelectedUserId(first.id);
            setDraftPermissions({ ...first.permissions });
          }
          setLoadState({ status: "ready" });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unexpected error while loading users.",
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  function handleSelectUser(user: UserSummary) {
    setSelectedUserId(user.id);
    setDraftPermissions({ ...user.permissions });
    setSaveMessage(null);
  }

  function togglePermission(key: PermissionKey) {
    setDraftPermissions((current) => {
      if (!current) return current;
      return { ...current, [key]: !current[key] };
    });
    setSaveMessage(null);
  }

  function setAllPermissions(enabled: boolean) {
    setDraftPermissions((current) => {
      if (!current) return current;
      const next: PermissionSet = { ...current };
      for (const key of permissionKeys) {
        next[key] = enabled;
      }
      return next;
    });
    setSaveMessage(null);
  }

  async function handleSave() {
    if (!selectedUser || !draftPermissions) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveUserPermissionSet({
        userId: selectedUser.id,
        permissions: draftPermissions,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, permissions: { ...draftPermissions } }
            : u,
        ),
      );

      setSaveMessage("Permissions updated.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Failed to save permissions. Check admin configuration.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border gaia-border p-4">
      <header className="space-y-1">
        <h2 className="font-medium">Permissions</h2>
        <p className="text-sm gaia-muted">
          Control which GAIA sections each Supabase user can see. This uses
          Supabase admin access and the internal <code>user_storage</code>{" "}
          table.
        </p>
      </header>

      {loadState.status === "loading" && (
        <p className="text-sm gaia-muted">Loading users…</p>
      )}

      {loadState.status === "error" && (
        <p className="text-sm text-red-400">
          {loadState.message ||
            "Unable to load users. Check your Supabase admin configuration."}
        </p>
      )}

      {loadState.status === "ready" && users.length === 0 && (
        <p className="text-sm gaia-muted">
          No users found yet. Create a user by signing up or using the admin
          tools.
        </p>
      )}

      {loadState.status === "ready" && users.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row">
          {/* User list */}
          <div className="md:w-1/3 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide gaia-muted">
              Users
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {users.map((user) => {
                const isActive = user.id === selectedUserId;
                const name = userDisplayName(user);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm transition ${
                      isActive ? "gaia-contrast" : "gaia-border gaia-hover-soft"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      {user.email && (
                        <span className="text-xs gaia-muted">{user.email}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permission editor */}
          <div className="md:w-2/3 space-y-3">
            {!selectedUser || !draftPermissions ? (
              <p className="text-sm gaia-muted">
                Select a user from the list to edit their permissions.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide gaia-muted">
                      Permissions for
                    </h3>
                    <p className="text-sm font-medium">
                      {userDisplayName(selectedUser)}
                    </p>
                    {selectedUser.email && (
                      <p className="text-xs gaia-muted">{selectedUser.email}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAllPermissions(true)}
                      className="rounded border px-2 py-1 text-xs gaia-border gaia-hover-soft"
                    >
                      Allow all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllPermissions(false)}
                      className="rounded border px-2 py-1 text-xs gaia-border gaia-hover-soft"
                    >
                      Deny all
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                  {permissionKeys.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 rounded border px-2 py-1.5 gaia-border gaia-hover-soft"
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3"
                        checked={Boolean(draftPermissions[key])}
                        onChange={() => togglePermission(key)}
                      />
                      <span>{labelForPermission(key)}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {saveMessage && (
                    <p className="text-xs gaia-muted">{saveMessage}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SettingsPermissionsTab;
