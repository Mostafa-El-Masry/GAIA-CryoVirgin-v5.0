"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  GaiaUser,
  GaiaUserPermissions,
  GaiaUserRole,
} from "@/lib/users/types";

interface UsersApiListResponse {
  ok: boolean;
  users?: GaiaUser[];
  error?: string;
}

interface UsersApiWriteResponse {
  ok: boolean;
  user?: GaiaUser;
  error?: string;
}

const LOCAL_USERS_KEY = "gaia_users_cache_v1";
const LOCAL_CURRENT_USER_ID_KEY = "gaia_current_user_id_v1";

function loadUsersFromLocal(): GaiaUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveUsersToLocal(users: GaiaUser[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function getCurrentUserIdLocal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_CURRENT_USER_ID_KEY);
  } catch {
    return null;
  }
}

function setCurrentUserIdLocal(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!id) {
      window.localStorage.removeItem(LOCAL_CURRENT_USER_ID_KEY);
    } else {
      window.localStorage.setItem(LOCAL_CURRENT_USER_ID_KEY, id);
    }
  } catch {
    // ignore
  }
}

const defaultPermissions: GaiaUserPermissions = {
  canViewInstagramPrivate: true,
  canViewWealth: true,
  canViewHealth: true,
  canViewGuardian: true,
};

const emptyUser: GaiaUser = {
  id: "",
  displayName: "",
  email: null,
  role: "member",
  permissions: { ...defaultPermissions },
  createdAt: "",
};

const UsersSettingsClient: React.FC = () => {
  const [users, setUsers] = useState<GaiaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<GaiaUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const localUsers = loadUsersFromLocal();
    if (localUsers.length > 0) {
      setUsers(localUsers);
    }
    setCurrentUserId(getCurrentUserIdLocal());

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users");
        const data = (await res.json()) as UsersApiListResponse;
        if (!data.ok) {
          throw new Error(data.error || "Failed to load users.");
        }
        const fetchedUsers = data.users ?? [];
        setUsers(fetchedUsers);
        saveUsersToLocal(fetchedUsers);
        setCurrentUserId((prev) => {
          if (prev) return prev;
          const owner = fetchedUsers.find((u) => u.role === "owner");
          const first = owner ?? fetchedUsers[0];
          const id = first ? first.id : null;
          if (id) setCurrentUserIdLocal(id);
          return id;
        });
      } catch (err: any) {
        setError(err?.message ?? "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const activeUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId],
  );

  const startCreate = () => {
    setEditing({
      ...emptyUser,
      id: "",
      permissions: { ...defaultPermissions },
    });
  };

  const startEdit = (user: GaiaUser) => {
    setEditing({
      ...user,
      permissions: { ...defaultPermissions, ...user.permissions },
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleChangeField = (field: keyof GaiaUser, value: any) => {
    setEditing((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleChangePermissions = (patch: Partial<GaiaUserPermissions>) => {
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            permissions: { ...prev.permissions, ...patch },
          }
        : prev,
    );
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.displayName.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!editing.id) {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: editing.displayName.trim(),
            email: editing.email,
            role: editing.role,
            permissions: editing.permissions,
          }),
        });
        const data = (await res.json()) as UsersApiWriteResponse;
        if (!data.ok || !data.user) {
          throw new Error(data.error || "Failed to create user.");
        }
        const next = [...users, data.user];
        setUsers(next);
        saveUsersToLocal(next);
        setEditing(null);
      } else {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            displayName: editing.displayName.trim(),
            email: editing.email,
            role: editing.role,
            permissions: editing.permissions,
          }),
        });
        const data = (await res.json()) as UsersApiWriteResponse;
        if (!data.ok || !data.user) {
          throw new Error(data.error || "Failed to update user.");
        }
        const next = users.map((u) =>
          u.id === data.user!.id ? data.user! : u,
        );
        setUsers(next);
        saveUsersToLocal(next);
        setEditing(null);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!data.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }
      const next = users.filter((u) => u.id !== id);
      setUsers(next);
      saveUsersToLocal(next);
      if (currentUserId === id) {
        const fallback = next[0]?.id ?? null;
        setCurrentUserId(fallback);
        setCurrentUserIdLocal(fallback);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetCurrentUser = (id: string) => {
    setCurrentUserId(id);
    setCurrentUserIdLocal(id);
  };

  return (
    <main className="min-h-[60vh] px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-50">
              Users &amp; Permissions
            </h1>
            <p className="text-[12px] text-zinc-400">
              Create multiple GAIA users, assign roles, and control who can see
              private parts of your world. Data is stored in Supabase and
              mirrored in your browser for quick access.
            </p>
            {activeUser && (
              <p className="mt-1 text-[11px] text-emerald-300">
                Active user:&nbsp;
                <span className="font-medium">{activeUser.displayName}</span>
                {activeUser.role === "owner" && (
                  <span className="ml-1 text-[10px] text-emerald-400">
                    (Owner)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-zinc-50 hover:bg-zinc-800"
            >
              + Add user
            </button>
          </div>
        </header>

        {error && <p className="text-[11px] text-red-400">{error}</p>}

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <div className="rounded-xl border border-zinc-800/70 bg-black/40 p-3 text-[11px]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-zinc-200">User list</p>
              {loading && (
                <span className="text-[10px] text-zinc-500">
                  Loading from Supabase…
                </span>
              )}
            </div>
            {users.length === 0 && !loading && (
              <p className="text-[11px] text-zinc-400">
                No users yet. Click &quot;Add user&quot; to create the first
                profile.
              </p>
            )}
            {users.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] text-zinc-400">
                      <th className="px-2 py-1 text-left font-normal">
                        Active
                      </th>
                      <th className="px-2 py-1 text-left font-normal">Name</th>
                      <th className="px-2 py-1 text-left font-normal">Role</th>
                      <th className="px-2 py-1 text-left font-normal">
                        Private instagram
                      </th>
                      <th className="px-2 py-1 text-left font-normal">
                        Wealth
                      </th>
                      <th className="px-2 py-1 text-left font-normal">
                        Health
                      </th>
                      <th className="px-2 py-1 text-left font-normal">
                        Guardian
                      </th>
                      <th className="px-2 py-1 text-right font-normal">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-zinc-900/60 hover:bg-zinc-900/40"
                      >
                        <td className="px-2 py-1">
                          <input
                            type="radio"
                            name="active-user"
                            className="h-3 w-3"
                            checked={currentUserId === user.id}
                            onChange={() => handleSetCurrentUser(user.id)}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-zinc-100">
                              {user.displayName}
                            </span>
                            {user.email && (
                              <span className="text-[10px] text-zinc-500">
                                {user.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1 text-zinc-300">
                          {user.role === "owner"
                            ? "Owner"
                            : user.role === "guest"
                              ? "Guest"
                              : "Member"}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {user.permissions.canViewInstagramPrivate ? "✓" : "–"}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {user.permissions.canViewWealth ? "✓" : "–"}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {user.permissions.canViewHealth ? "✓" : "–"}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {user.permissions.canViewGuardian ? "✓" : "–"}
                        </td>
                        <td className="px-2 py-1 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(user)}
                              className="text-[10px] text-zinc-300 hover:text-zinc-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="text-[10px] text-red-400 hover:text-red-300 disabled:opacity-60"
                            >
                              {deletingId === user.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800/70 bg-black/40 p-3 text-[11px]">
            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSave();
                }}
                className="space-y-3"
              >
                <h2 className="text-[11px] font-medium text-zinc-200">
                  {editing.id ? "Edit user" : "Create user"}
                </h2>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editing.displayName}
                    onChange={(e) =>
                      handleChangeField("displayName", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-black/60 px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="User name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={editing.email ?? ""}
                    onChange={(e) =>
                      handleChangeField("email", e.target.value || null)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-black/60 px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">
                    Role
                  </label>
                  <select
                    value={editing.role}
                    onChange={(e) =>
                      handleChangeField("role", e.target.value as GaiaUserRole)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-black/60 px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="owner">Owner</option>
                    <option value="member">Member</option>
                    <option value="guest">Guest</option>
                  </select>
                  <p className="text-[10px] text-zinc-500">
                    Owner is you (creator). Guests are limited accounts.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-400">
                    Permissions
                  </label>
                  <div className="space-y-1 rounded-md border border-zinc-800 bg-black/40 p-2">
                    <label className="flex items-center gap-2 text-[11px] text-zinc-200">
                      <input
                        type="checkbox"
                        checked={editing.permissions.canViewInstagramPrivate}
                        onChange={(e) =>
                          handleChangePermissions({
                            canViewInstagramPrivate: e.target.checked,
                          })
                        }
                        className="h-3 w-3"
                      />
                      <span>Can see private instagram items</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] text-zinc-200">
                      <input
                        type="checkbox"
                        checked={editing.permissions.canViewWealth}
                        onChange={(e) =>
                          handleChangePermissions({
                            canViewWealth: e.target.checked,
                          })
                        }
                        className="h-3 w-3"
                      />
                      <span>Can see Wealth module</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] text-zinc-200">
                      <input
                        type="checkbox"
                        checked={editing.permissions.canViewHealth}
                        onChange={(e) =>
                          handleChangePermissions({
                            canViewHealth: e.target.checked,
                          })
                        }
                        className="h-3 w-3"
                      />
                      <span>Can see Health module</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] text-zinc-200">
                      <input
                        type="checkbox"
                        checked={editing.permissions.canViewGuardian}
                        onChange={(e) =>
                          handleChangePermissions({
                            canViewGuardian: e.target.checked,
                          })
                        }
                        className="h-3 w-3"
                      />
                      <span>Can see Guardian / Brain pages</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-zinc-700 px-3 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-1 text-[11px] font-medium text-emerald-50 hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save user"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex h-full flex-col items-start justify-center text-[11px] text-zinc-400">
                <p>
                  Select a user from the list to edit, or click &quot;Add
                  user&quot; to create a new one.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default UsersSettingsClient;
