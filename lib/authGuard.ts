import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAuth() {
  if (!(await getSession())) redirect("/auth/login");
}
