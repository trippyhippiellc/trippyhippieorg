"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export function UnderConstructionModal() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("[UnderConstructionModal] Submitting password:", password);
      const response = await fetch("/api/construction", {
        method: "POST",
        credentials: "include",  // Include cookies in request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      console.log("[UnderConstructionModal] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[UnderConstructionModal] Error response:", errorData);
        setError("Invalid password. Try again.");
        setIsLoading(false);
        return;
      }

      console.log("[UnderConstructionModal] Password accepted, refreshing page");
      // Wait a moment for cookie to be set, then reload
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    } catch (err) {
      console.error("[UnderConstructionModal] Error:", err);
      setError("Failed to verify password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Under Construction
          </h1>
          <p className="text-slate-400">
            We're working on something special. Check back soon!
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Enter Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? "Verifying..." : "Access Site"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Trippy Hippie © 2026</p>
        </div>
      </div>
    </div>
  );
}
