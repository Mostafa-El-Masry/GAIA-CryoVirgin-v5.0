import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  if (typeof window === "undefined") return null;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey);
  return client;
}

export function hasSupabaseClient(): boolean {
  return !!getSupabaseClient();
}
