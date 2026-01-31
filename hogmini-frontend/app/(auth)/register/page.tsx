/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Registration successful — please check your email.");
      setSuccess(true);
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification email to <strong>{email}</strong>.
            Please check your inbox and click the verification link to activate
            your account.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Login
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="block w-full px-6 py-2 text-indigo-600 hover:text-indigo-500"
            >
              Didn&apos;t receive email? Register again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 0.06)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[128px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tracking-tight">
              HogMini
            </span>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold tracking-tight leading-tight mb-4">
              Ship features with confidence
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Control feature releases, run A/B tests, and manage remote config
              across your entire stack.
            </p>
            <div className="flex flex-wrap gap-2 mt-8">
              {[
                "Feature Flags",
                "Remote Config",
                "A/B Testing",
                "Targeting",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 rounded-full text-gray-800"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Trusted by teams at{" "}
            <span className="font-medium text-gray-700">kwizSpark</span>,{" "}
            <span className="font-medium text-gray-700">CreatorDorm</span>, and{" "}
            <span className="font-medium text-gray-700">Lynkr</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <span className="text-xl font-semibold tracking-tight">
              HogMini
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-sm text-gray-600">
              Sign up to create a new account
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant="outline"
              type="button"
              className="h-11 flex items-center justify-center"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-11 flex items-center justify-center"
            >
              <GitHubIcon className="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="default"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <span className="flex items-center gap-2">
                    Create account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
