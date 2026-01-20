import { NextResponse } from "next/server";
import { getSession, isExpired, rotateSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({});

  if (isExpired(session)) {
    await rotateSession(session);
  }

  return NextResponse.json({ ok: true });
}
