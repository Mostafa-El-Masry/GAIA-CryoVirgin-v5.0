import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await admin.auth.getUser(session.access_token);

  if (data?.user?.user_metadata?.role !== "admin") {
    redirect("/dashboard");
  }
}
