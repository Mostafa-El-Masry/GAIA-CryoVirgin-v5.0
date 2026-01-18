
import { redirect } from "next/navigation";
import { getSession } from "./session";

export function requireAuth() {
  const session = getSession();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}
