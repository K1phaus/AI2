import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "@/lib/env";

/**
 * Creates a Supabase client for browser usage
 * Uses NEXT_PUBLIC_* environment variables
 * 
 * IMPORTANT: Uses direct exports from env.ts (not dynamic access)
 * so Next.js can statically analyze and inline values in client bundles.
 */
export function createBrowserClient() {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
