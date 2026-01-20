"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import crypto from "crypto";

const SESSION_COOKIE = "gaia.session";
const CSRF_COOKIE = "gaia.csrf";

export async function loginWithEmail(email: string, password: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error("Invalid credentials");
  }

  const csrf = crypto.randomUUID();
  const headersStore = await headers();
  const ua = headersStore.get("user-agent") ?? "";
  const ip = headersStore.get("x-forwarded-for") ?? "";
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      ua_hash: crypto.createHash("sha256").update(ua).digest("hex"),
      ip_hash: crypto.createHash("sha256").update(ip).digest("hex"),
    }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );

  cookieStore.set(CSRF_COOKIE, csrf, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
  redirect("/auth/login");
}
