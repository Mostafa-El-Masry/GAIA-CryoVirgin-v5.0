"use client";

import { useState, useEffect } from "react";
import type { GaiaUser } from "./types";

export function useActiveUser(): { user: GaiaUser | null; loading: boolean } {
  const [user, setUser] = useState<GaiaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading active user from localStorage or context
    // This is a placeholder implementation
    try {
      const stored = window?.localStorage?.getItem("gaia_current_user_v1");
      if (stored) {
        const parsed = JSON.parse(stored) as GaiaUser;
        setUser(parsed);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
