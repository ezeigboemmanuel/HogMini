"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo } from "react";
import { Button } from "./ui/button";
import GitHubIcon from "./icons/GitHubIcon";
import logoImg from "./icons/logo.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

import { useAuth } from "../app/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const navItems = ["Product", "Solutions", "Resources", "Developers", "Pricing"];

type Props = {
  minimal?: boolean;
};

function hashString(str?: string | null) {
  if (!str) return 0;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

const PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

function getColorForString(s?: string | null) {
  const hash = hashString(s || "");
  return PALETTE[hash % PALETTE.length];
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar = ({ minimal = false }: Props) => {
  const { user, loading, logout } = useAuth();
  const idForColor = useMemo(
    () => user?.id || user?.email || "anonymous",
    [user?.id, user?.email],
  );
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    "https://github.com/ezeigboemmanuel/HogMini";

  if (minimal) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image src={logoImg} alt="HogMini" width={28} height={28} />
                <span className="text-lg font-bold text-black">HogMini</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="GitHub">
                <Link href={githubUrl} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-325 mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src={logoImg} alt="HogMini" width={28} height={28} />
              <span className="text-lg font-bold text-foreground">HogMini</span>
            </Link>
          </div>

          {/* Middle: Nav links (hidden when logged in or loading) */}
          <nav className="hidden md:flex space-x-6">
            {!loading &&
              !user &&
              navItems.map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground font-medium"
                >
                  {item}
                </Link>
              ))}
          </nav>

          {/* Right: Buttons */}
          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground font-medium"
                >
                  Docs
                </Link>

                {/* Replace Account link with dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center size-8 rounded-full overflow-hidden hover:opacity-90"
                      aria-label="User menu"
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || user.email}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={`size-8 inline-flex items-center justify-center text-sm font-medium text-white ${getColorForString(idForColor)} rounded-full`}
                        >
                          {getInitials(user.name, user.email)}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="bottom" align="end">
                    <div className="px-3 py-2">
                      <div className="font-semibold">
                        {user.name || user.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">
                        <User /> Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 hover:text-red-500!"
                      onSelect={() => logout()}
                    >
                      <LogOut className="stroke-red-500" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="icon" aria-label="GitHub">
                  <Link href={githubUrl} target="_blank" rel="noreferrer">
                    <GitHubIcon className="size-6" />
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>

                <Button>Contact Us</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
