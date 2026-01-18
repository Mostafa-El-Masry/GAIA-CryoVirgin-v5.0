import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SESSION_COOKIE = "gaia.session";

export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;

  try {
    const session = JSON.parse(cookie.value);
    if (!session.access_token || !session.expires_at) return null;
    if (Date.now() / 1000 > session.expires_at) return null;
    return session;
  } catch {
    return null;
  }
}

export async function createSupabaseUserClient() {
  const session = await getSession();
  if (!session) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    },
  );
}
