"use client";

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
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
            <div className="flex space-x-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
