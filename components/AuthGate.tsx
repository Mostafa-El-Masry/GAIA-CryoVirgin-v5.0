'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSnapshot } from '@/lib/auth-client';
import type { ReactNode } from 'react';

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Protects routes by requiring an active Supabase session.
 * Redirects to login if not authenticated.
 */
export default function AuthGate({ children, fallback }: AuthGateProps) {
  const router = useRouter();
  const { profile, status } = useAuthSnapshot();

  // Check if user is authenticated
  const isAuthenticated = Boolean(profile?.email || status?.email) && Boolean(status?.session);

  useEffect(() => {
    // If not authenticated and component is mounted, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // While checking authentication state, show fallback or nothing
  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
