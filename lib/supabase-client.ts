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




/**
 * Fetch inventory locations (example usage)
 */
export async function fetchLocations() {
  try {
    const response = await authenticatedFetch("/api/inventory/locations");
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

/**
 * Fetch products (example usage)
 */
export async function fetchProducts(categoryFilter?: string) {
  try {
    const url = new URL("/api/inventory/products", window.location.origin);
    if (categoryFilter) {
      url.searchParams.set("category", categoryFilter);
    }

    const response = await authenticatedFetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Fetch stock entries (example usage)
 */
export async function fetchStock(locationId?: string, productId?: string) {
  try {
    const url = new URL("/api/inventory/stock", window.location.origin);
    if (locationId) {
      url.searchParams.set("location_id", locationId);
    }
    if (productId) {
      url.searchParams.set("product_id", productId);
    }

    const response = await authenticatedFetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch stock: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stock:", error);
    throw error;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void,
) {
  const client = getSupabaseBrowserClient();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(callback);

  return subscription;
}
