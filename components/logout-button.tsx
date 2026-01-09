"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
    >
      Logout
    </button>
  );
}
