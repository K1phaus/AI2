import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
