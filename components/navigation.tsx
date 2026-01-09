import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function Navigation() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/equipment"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Equipment
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Signed in as <span className="font-medium">{user.email}</span>
              </span>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
