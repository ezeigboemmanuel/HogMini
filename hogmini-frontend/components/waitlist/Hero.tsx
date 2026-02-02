"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please provide an email");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Failed to join waitlist");
      } else {
        if (data?.message === "Already on waitlist") {
          toast("You're already on the waitlist.");
        } else {
          toast.success("Thanks! You're on the waitlist.");
          setEmail("");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-[#fafafa] text-black py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
          Feature flags for teams
          <br />
          who ship fast..
        </h1>
        <p className="text-sm text-gray-700 max-w-2xl mx-auto mb-6">
          Ship with confidence. Control every release.
        </p>

        <form
          id="signup"
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-center"
        >
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white text-black rounded-full h-12 px-4 shadow-sm border border-gray-200 placeholder-gray-400"
            required
          />
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto rounded-full h-12 px-6 bg-black text-white hover:opacity-95 shadow-md"
          >
            {loading ? "Joining..." : "Join the Waitlist"}
          </Button>
        </form>
      </div>
    </header>
  );
}
