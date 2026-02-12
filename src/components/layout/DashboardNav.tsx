"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth-helpers";
import { useRouter } from "next/navigation";

export function DashboardNav() {
  const { company } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/overview"
                className="text-xl font-bold text-blue-600 hover:text-blue-700"
              >
                EcoNexus
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>

              {/* NEW: Material Management Dropdown */}
              <div className="relative group inline-flex items-center">
                <button className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Materials <span className="ml-1 text-xs">▾</span>
                </button>
                <div className="hidden group-hover:block absolute left-0 top-full mt-0 w-48 bg-white shadow-lg rounded-b-lg py-2 z-50 border border-gray-100">
                  <Link
                    href="/dashboard/materials/requirements"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Requirements
                  </Link>
                  <Link
                    href="/dashboard/materials/upload"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Upload Invoice
                  </Link>
                </div>
              </div>

              <Link
                href="/dashboard/agents"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Agent Feed
              </Link>

              <Link
                href="/dashboard/deals"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Deals
              </Link>

              <Link
                href="/dashboard/analytics"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Analytics
              </Link>

              <Link
                href="/dashboard/nexus"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Nexus
              </Link>

              <Link
                href="/dashboard/passports"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Passports
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href="/kpi_analytics"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {company?.name ?? "Company"}
              </Link>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
