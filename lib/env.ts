/**
 * Environment variable validation helper
 * Throws clear errors if required env vars are missing at runtime
 * 
 * IMPORTANT: Uses direct property access (process.env.NEXT_PUBLIC_*) 
 * so Next.js can statically analyze and inline values in client bundles.
 * Dynamic key access (process.env[key]) does NOT work in client code.
 */

function validateEnvVar(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`
    );
  }
  return value;
}

// Direct property access for client bundles (Next.js can statically analyze these)
export const PUBLIC_SUPABASE_URL = validateEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL"
);

export const PUBLIC_SUPABASE_ANON_KEY = validateEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
);

// Server-side convenience object (can use dynamic access since it's server-only)
export const env = {
  supabase: {
    url: PUBLIC_SUPABASE_URL,
    anonKey: PUBLIC_SUPABASE_ANON_KEY,
  },
} as const;
