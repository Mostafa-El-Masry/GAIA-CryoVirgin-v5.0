
/**
 * AuthGate is deprecated.
 * Server-side middleware + requireAuth() now enforce access.
 * This component is intentionally a passthrough to avoid client-side auth checks.
 */

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
