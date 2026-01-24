"use client";

import React, { useContext, useEffect, useState, ReactNode } from "react";
import {
  getSupabaseBrowserClient,
  isSupabaseClientConfigured,
  onAuthStateChange,
} from "@/lib/supabase-client";

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial user
    if (!isSupabaseClientConfigured) {
      console.warn("Supabase client is not configured");
      setError(
        "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setLoading(false);
      return;
    }

    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } =
          await getSupabaseBrowserClient().auth.getSession();
        if (!mounted) return;

        if (error) {
          console.error("Auth session error:", error);
          setError(error.message);
          setUser(null);
        } else {
          console.log(
            "Auth session loaded:",
            data.session ? "authenticated" : "not authenticated",
          );
          setUser(data.session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to check session:", err);
        setError("Failed to check session");
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Subscribe to auth changes
    const subscription = onAuthStateChange((event, session) => {
      console.log(
        "Auth state change:",
        event,
        session ? "authenticated" : "not authenticated",
      );
      setUser(session?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default empty state instead of throwing during SSR
    return {
      user: null,
      loading: true,
      error: null,
    };
  }
  return context;
};
