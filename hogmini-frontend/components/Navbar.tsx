import Link from "next/link";
import { Button } from "./ui/button";
import GitHubIcon from "./icons/GitHubIcon";

const navItems = ["Product", "Solutions", "Resources", "Developers", "Pricing"];

type Props = {
  minimal?: boolean;
};

const Navbar = ({ minimal = false }: Props) => {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/ezeigboemmanuel/HogMini";

  if (minimal) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-lg font-bold text-black">
                HogMini
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
            <Link href="/" className="text-lg font-bold text-foreground">
              HogMini
            </Link>
          </div>

          {/* Middle: Nav links */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="GitHub">
              <GitHubIcon className="size-6" />
            </Button>

            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>

            <Button>Contact Us</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
