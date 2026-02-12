"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNav } from "@/components/layout/DashboardNav";
import {
  startAgentScheduler,
  stopAgentScheduler,
} from "@/lib/utils/agent-scheduler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, company } = useAuth();

  useEffect(() => {
    if (user && company) {
      console.log("👤 User logged in, starting agent scheduler...");
      startAgentScheduler();
    }

    return () => {
      stopAgentScheduler();
    };
  }, [user, company]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
