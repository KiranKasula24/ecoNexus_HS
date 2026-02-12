"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/auth-helpers";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    entityType: "manufacturer" as
      | "manufacturer"
      | "recycler"
      | "logistics"
      | "energy_recovery",
    address: "",
    city: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.companyName,
        industry: formData.industry,
        entity_type: formData.entityType,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg border border-gray-700 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div
                className="absolute w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-40 transition-all duration-500 group-hover:opacity-90 group-hover:blur-[90px]"
              />
              <img
                src="/ecoNexus-logo.png"
                alt="EcoNexus Logo"
                className="w-32 rounded-3xl relative z-10 transition-all duration-500 group-hover:scale-110"
              />
            </div>

            <h1 className="text-xl font-bold text-white text-center mt-4">
              Join EcoNexus
            </h1>
            <p className="text-gray-400 text-sm text-center mt-1">
              Deploy your AI agent and start finding circular opportunities
            </p>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto px-8 pb-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email Address"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Password */}
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password (min 6 characters)"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Confirm Password */}
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm Password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Divider */}
            <div className="pt-2 border-t border-gray-700 space-y-4">

              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Company Name"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="Industry"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <select
                value={formData.entityType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entityType: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="manufacturer">Manufacturing Company</option>
                <option value="recycler">Recycler / Waste Processor</option>
                <option value="logistics">Logistics Provider</option>
                <option value="energy_recovery">Energy Recovery Facility</option>
              </select>

              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Address"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Country"
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition"
            >
              {loading ? "Creating Account..." : "Register & Deploy Agent"}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 hover:underline">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
