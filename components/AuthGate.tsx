"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're definitely not authenticated
    // Give the auth system time to initialize
    const timer = setTimeout(() => {
      if (!loading && !user && !error) {
        console.log("AuthGate: No user found, redirecting to login");
        router.push("/auth/login");
      }
    }, 500); // Increased timeout

    return () => clearTimeout(timer);
  }, [user, loading, error, router]);

  // Show loading while auth is being determined
  if (loading || (!user && !error)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gaia-text-default)] mx-auto"></div>
          <p className="mt-4 text-[var(--gaia-text-default)]">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gaia-text-default)] mx-auto"></div>
          <p className="mt-4 text-[var(--gaia-text-default)] text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
