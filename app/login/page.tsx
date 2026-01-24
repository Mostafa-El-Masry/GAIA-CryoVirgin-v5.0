import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Check if already authenticated
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");

  if (sessionId) {
    // If session exists, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
