"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } else {
      router.push("/login?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Completing sign in...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<p>Loading...</p>}>
        <OAuthCallbackHandler />
      </Suspense>
    </div>
  );
}