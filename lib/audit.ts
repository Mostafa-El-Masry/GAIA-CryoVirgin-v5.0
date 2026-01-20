import { createClient } from "@supabase/supabase-js";

export async function audit(event: string, userId?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await supabase.from("audit_logs").insert({
    event,
    user_id: userId ?? null,
  });
}
