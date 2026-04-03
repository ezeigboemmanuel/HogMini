"use client";

import Hero from "@/components/waitlist/Hero";
import BrowserPreview from "@/components/waitlist/BrowserPreview";
import Footer from "@/components/waitlist/Footer";

export default function WaitlistPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <section className="max-w-3xl mx-auto w-full px-6 py-12">
        <BrowserPreview />
      </section>
      <Footer />
    </main>
  );
}
