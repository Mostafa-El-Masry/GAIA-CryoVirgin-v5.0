import { NextResponse } from "next/server";
import { getCsrfToken } from "@/lib/auth/cookies";

export async function GET() {
  const csrfToken = getCsrfToken();

  if (!csrfToken) {
    return NextResponse.json({ error: "No CSRF token" }, { status: 404 });
  }

  return NextResponse.json({ csrfToken });
}
