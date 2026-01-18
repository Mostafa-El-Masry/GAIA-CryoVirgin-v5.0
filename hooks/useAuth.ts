
/**
 * useAuth is deprecated.
 * Auth is enforced server-side. Do not use client auth state.
 */

export function useAuth() {
  return {
    user: null,
    loading: false,
    authenticated: true,
  };
}
