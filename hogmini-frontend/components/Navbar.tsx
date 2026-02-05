"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import GitHubIcon from "./icons/GitHubIcon";
import logoImg from "./icons/logo.png";
import { useAuth } from "../app/contexts/AuthContext";

const navItems = ["Product", "Solutions", "Resources", "Developers", "Pricing"];

type Props = {
  minimal?: boolean;
};

const Navbar = ({ minimal = false }: Props) => {
  const { user, loading } = useAuth();
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/ezeigboemmanuel/HogMini";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {!loading && !user && navItems.map((item) => (
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
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground font-medium">
                  Docs
                </Link>
                <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground font-medium">
                  Account
                </Link>
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
