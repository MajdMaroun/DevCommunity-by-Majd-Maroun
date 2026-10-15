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
  Bell,
  Code2,
} from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/blogs", label: "Blogs", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-gray-800 bg-gray-950/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[9px] font-medium transition-colors sm:text-[10px] ${
              active
                ? "text-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="max-w-full truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-950 p-4 md:flex">
        {/* Logo */}
        <Link
          href="/"
          aria-label="DevCommunity home"
          className="mb-4 flex w-full items-center gap-3 px-1"
        >
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15">
            <Code2
              size={26}
              strokeWidth={2.3}
              className="text-indigo-400"
            />
          </div>

          {/* Name and tagline */}
          <div className="min-w-0 flex-1">
            <h1 className="whitespace-nowrap text-[17px] font-bold tracking-tight text-white">
              DevCommunity
            </h1>

            <p className="mt-1 text-[10px] leading-4 text-gray-500">
              Connect. Learn. Build Together.
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 1.8}
                  className="shrink-0"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Promo Card */}
        <div className="mt-auto rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-semibold text-white">
            Good developers build better together.
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            Join a community. Share knowledge. Grow your career.
          </p>

          <Link
            href="/create"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Create Post
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2 px-1 text-xs text-gray-600">
          <span>DevCommunity</span>
          <span>v1.0.0</span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </>
  );
}