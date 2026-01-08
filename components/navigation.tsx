import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 py-2">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
