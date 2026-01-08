import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Welcome to AI Inventory</h2>
      <div className="space-y-2">
        <p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </p>
        <p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
