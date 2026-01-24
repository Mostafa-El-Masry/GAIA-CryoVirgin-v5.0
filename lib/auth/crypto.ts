import { createHmac } from "crypto";
import { APP_SECRET } from "@/env";

if (!APP_SECRET) {
  throw new Error("APP_SECRET environment variable is required");
}

export function signSession(sessionId: string): string {
  const hmac = createHmac("sha256", APP_SECRET!);
  hmac.update(sessionId);
  return hmac.digest("hex");
}

export function verifySession(sessionId: string, signature: string): boolean {
  const expectedSignature = signSession(sessionId);
  return expectedSignature === signature;
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
