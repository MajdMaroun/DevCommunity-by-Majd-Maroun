"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Users,
  FileText,
  Bookmark,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/blogs", label: "Blogs", icon: FileText },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-950 p-4 md:flex">
      {/* Logo */}
      <Link href="/" className="mb-6 block px-2">
        <h1 className="text-lg font-bold text-white">DevCommunity</h1>
        <p className="text-xs text-gray-500">
          Connect. Learn. Build Together.
        </p>
      </Link>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Promo card */}
      <div className="mt-auto rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h3 className="text-sm font-semibold text-white">
          Good developers build better together.
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          Join a community. Share knowledge. Grow your career.
        </p>
        <Link
          href="/create"
          className="mt-3 inline-block rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
        >
          Create Post
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between px-2 text-xs text-gray-600">
        <span>DevCommunity</span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
}