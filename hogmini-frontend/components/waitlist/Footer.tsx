"use client";

import GitHubIcon from "@/components/icons/GitHubIcon";
import Link from "next/link";

export default function Footer() {
  const xUrl = process.env.NEXT_PUBLIC_X_URL || "https://x.com/hogminidotcom";
  const github = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/ezeigboemmanuel/HogMini";

  return (
    <footer className="mt-auto bg-[#fafafa] py-8 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-black text-center md:text-left">
            © {new Date().getFullYear()} HogMini. All rights reserved.
          </div>

          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <span className="text-sm text-gray-700 mr-2 hidden sm:inline">Follow development</span>
            <Link href={xUrl} target="_blank" rel="noreferrer" className="text-black hover:opacity-80 p-2 rounded-md" aria-label="Follow on X">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30" fill="currentColor" aria-hidden>
                <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
              </svg>
            </Link>

            <Link href={github} target="_blank" rel="noreferrer" className="text-black hover:opacity-80 p-2 rounded-md" aria-label="GitHub">
              <GitHubIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
