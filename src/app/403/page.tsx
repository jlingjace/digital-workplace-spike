export const metadata = { title: "403 Forbidden — Digital Workplace" };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-200">403</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-700">Access Denied</h1>
        <p className="mt-2 text-gray-500">
          You don&apos;t have permission to view this page.
          <br />
          Contact your administrator if you believe this is an error.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
