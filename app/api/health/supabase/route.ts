import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET() {
  try {
    // Validate env vars are present
    const supabaseUrl = env.supabase.url;
    const supabaseAnonKey = env.supabase.anonKey;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test connection by calling Auth API (doesn't require DB tables)
    const { data, error } = await supabase.auth.getSession();

    // If there's an error, return failure
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Success - we got a response (even if no session, that's fine)
    return NextResponse.json({ ok: true });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
