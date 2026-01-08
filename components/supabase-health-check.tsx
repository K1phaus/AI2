"use client";

import { useState } from "react";

export default function SupabaseHealthCheck() {
  const [status, setStatus] = useState<{
    loading: boolean;
    ok: boolean | null;
    error: string | null;
  }>({
    loading: false,
    ok: null,
    error: null,
  });

  const checkHealth = async () => {
    setStatus({ loading: true, ok: null, error: null });

    try {
      const response = await fetch("/api/health/supabase");
      const data = await response.json();

      if (data.ok) {
        setStatus({ loading: false, ok: true, error: null });
      } else {
        setStatus({
          loading: false,
          ok: false,
          error: data.error || "Unknown error",
        });
      }
    } catch (err) {
      setStatus({
        loading: false,
        ok: false,
        error: err instanceof Error ? err.message : "Failed to check health",
      });
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={checkHealth}
        disabled={status.loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.loading ? "Checking..." : "Supabase Health Check"}
      </button>
      {status.ok === true && (
        <p className="text-green-600 font-medium">✓ Connection successful</p>
      )}
      {status.ok === false && (
        <p className="text-red-600 font-medium">
          ✗ Connection failed: {status.error}
        </p>
      )}
    </div>
  );
}
