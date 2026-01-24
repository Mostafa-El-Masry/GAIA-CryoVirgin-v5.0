import { headers } from "next/headers";
import { sessionStore } from "./session";
import { getSessionCookie } from "./cookies";

export interface ValidationResult {
  isValid: boolean;
  userId?: string;
  error?: string;
}

export async function validateSession(): Promise<ValidationResult> {
  const sessionId = await getSessionCookie();
  if (!sessionId) {
    return { isValid: false, error: "No session cookie" };
  }

  const session = sessionStore.getSession(sessionId);
  if (!session) {
    return { isValid: false, error: "Session not found or expired" };
  }

  // Lightweight user agent and IP binding
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");

  if (session.userAgent && session.userAgent !== userAgent) {
    return { isValid: false, error: "User agent mismatch" };
  }

  if (session.ip && session.ip !== ip) {
    return { isValid: false, error: "IP mismatch" };
  }

  return { isValid: true, userId: session.userId };
}

export async function requireAuth(): Promise<{ userId: string }> {
  const result = await validateSession();
  if (!result.isValid) {
    throw new Error(result.error || "Authentication required");
  }
  return { userId: result.userId! };
}
