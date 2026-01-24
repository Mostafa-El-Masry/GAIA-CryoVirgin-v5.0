import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/validate";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const result = await validateSession();

  if (!result.isValid) {
    redirect("/login");
  }

  return <DashboardContent userId={result.userId!} />;
}
