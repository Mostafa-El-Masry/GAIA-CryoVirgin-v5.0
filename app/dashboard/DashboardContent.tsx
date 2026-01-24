"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Fetch CSRF token
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      })
      .catch((err) => console.error("Failed to fetch CSRF token:", err));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csrfToken }),
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      alert("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard
            </h1>
            <div className="mb-6">
              <p className="text-gray-600">
                You are logged in as user:{" "}
                <span className="font-semibold">{userId}</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
