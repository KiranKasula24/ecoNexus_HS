"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth-helpers";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);

      // 🔥 important: ensure redirect happens
      router.push("/setup");
      router.refresh(); // helps in some auth setups
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
        
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/ecoNexus-logo.png"
            alt="EcoNexus Logo"
            className="w-40 mb-6 rounded-3xl shadow-[0_0_40px_10px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_20px_rgba(16,185,129,0.8)] transition-all duration-500"
          />
          <h1 className="text-2xl font-bold text-white text-center">
            Sign in to EcoNexus
          </h1>
          <p className="text-gray-400 text-sm text-center mt-1">
            Access your AI agent and circular economy dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@company.com"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-emerald-400 hover:underline"
            >
              Register now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
