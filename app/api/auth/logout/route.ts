import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/auth/session";
import {
  getSessionCookie,
  clearSessionCookie,
  clearCsrfToken,
  getCsrfToken,
} from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    const body = await request.json();
    const { csrfToken } = body;
    const expectedCsrfToken = await getCsrfToken();

    if (!csrfToken || csrfToken !== expectedCsrfToken) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 },
      );
    }

    const sessionId = await getSessionCookie();

    if (sessionId) {
      // Destroy session
      sessionStore.destroySession(sessionId);
    }

    // Clear cookies
    await clearSessionCookie();
    await clearCsrfToken();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
