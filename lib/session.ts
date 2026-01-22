import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SESSION_COOKIE = "gaia.session";

export type GaiaSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export async function getSession(): Promise<GaiaSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const s = JSON.parse(raw) as GaiaSession;
    return s;
  } catch {
    return null;
  }
}

export function isExpired(s: GaiaSession) {
  return Date.now() / 1000 > s.expires_at - 30;
}

export async function rotateSession(s: GaiaSession) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase.auth.refreshSession({
    refresh_token: s.refresh_token,
  });

  if (!data?.session) return null;

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify({
      ...s,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    },
  );

  return data.session;
}
