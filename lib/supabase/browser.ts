import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Creates a Supabase client for browser usage
 * Uses NEXT_PUBLIC_* environment variables
 */
export function createBrowserClient() {
  return createClient(env.supabase.url, env.supabase.anonKey);
}
