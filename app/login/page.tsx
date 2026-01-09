import LoginForm from "@/components/login-form";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we&apos;ll send you a magic link to sign in.
      </p>
      {params?.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {decodeURIComponent(params.error)}
        </div>
      )}
      <LoginForm />
    </div>
  );
}
