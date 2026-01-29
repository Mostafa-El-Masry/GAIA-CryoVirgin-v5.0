/**
 * lib/supabase-client.ts
 *
 * Client-side Supabase client for browser-based authentication and queries.
 * Handles session management and JWT token refresh.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseClientConfigured = Boolean(
  supabaseUrl && supabaseAnonKey,
);

let supabaseClient: any | null = null;

function getSupabaseBrowserClient(): any {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }

  return supabaseClient;
}

if (isSupabaseClientConfigured) {
  supabaseClient = getSupabaseBrowserClient();
}

export { supabaseClient, getSupabaseBrowserClient };

