"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const hint = params.get("hint");
  const error = params.get("error");

  let message = "An authentication error occurred.";
  if (error === "AccessDenied" && hint === "domain") {
    message = "Only @yourcompany.com accounts are allowed to sign in.";
  } else if (error === "AccessDenied") {
    message = "You are not authorized to access this application.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-5xl font-bold text-red-300">Auth Error</p>
        <p className="mt-4 text-gray-600">{message}</p>
        <a
          href="/api/auth/signin"
          className="mt-6 inline-block rounded bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try again
        </a>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
