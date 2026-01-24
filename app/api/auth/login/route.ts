import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { sessionStore } from "@/lib/auth/session";
import { setSessionCookie, setCsrfToken } from "@/lib/auth/cookies";
import { generateSessionId } from "@/lib/auth/crypto";
import type { LoginCredentials } from "@/types/auth";

// Mock user validation - replace with real DB lookup
async function validateCredentials(credentials: LoginCredentials) {
  // For demo purposes - replace with actual authentication
  if (
    credentials.email === "user@example.com" &&
    credentials.password === "password"
  ) {
    return { id: "user-1", email: credentials.email, name: "Demo User" };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await validateCredentials({ email, password });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Get user agent and IP for binding
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      undefined;

    // Create session
    const sessionId = sessionStore.createSession(user.id, userAgent, ip);

    // Set session cookie
    setSessionCookie(sessionId);

    // Set CSRF token
    const csrfToken = generateSessionId();
    setCsrfToken(csrfToken);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      csrfToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
