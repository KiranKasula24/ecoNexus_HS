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

    // Validation
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

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <section className="bg-gray-900 min-h-screen flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Join EcoNexus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Deploy your AI agent and start finding circular opportunities
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>

        {error && (
          <div className="rounded-md bg-red-900/40 border border-red-700 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="you@company.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Min 6 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Company Information
            </h3>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="ACME Manufacturing"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Industry *
            </label>
            <input
              type="text"
              required
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., Metal Fabrication, Recycling"
            />
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Entity Type *
            </label>
            <select
              value={formData.entityType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entityType: e.target.value as any,
                })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="manufacturer">Manufacturing Company</option>
              <option value="recycler">Recycler / Waste Processor</option>
              <option value="logistics">Logistics Provider</option>
              <option value="energy_recovery">Energy Recovery Facility</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              This determines your agent type and capabilities
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="123 Industrial Street"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Munich"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Country *
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="mt-1 w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Germany"
            />
          </div>

        </div>

        {/* Submit Button (UNCHANGED BLUE) */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"

        >
          {loading ? "Creating Account..." : "Register & Deploy Agent"}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-green-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

      </form>
    </div>
  </section>
);
}
