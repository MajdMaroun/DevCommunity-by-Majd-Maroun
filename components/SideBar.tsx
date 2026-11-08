"use client";

import { Suspense } from "react";
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

function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-950 p-4 md:flex">
        <Link
          href="/"
          aria-label="DevCommunity home"
          className="group mb-4 flex w-full items-center gap-3 px-1"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:border-indigo-400/60 group-hover:bg-indigo-500/25 group-hover:shadow-lg group-hover:shadow-indigo-500/20 group-active:scale-95 motion-reduce:transform-none">
            <Code2
              size={26}
              strokeWidth={2.3}
              className="text-indigo-400 transition-colors duration-300 group-hover:text-indigo-300"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="whitespace-nowrap text-[17px] font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-indigo-200">
              DevCommunity
            </h1>
            <p className="mt-1 text-[10px] leading-4 text-gray-500 transition-colors duration-300 group-hover:text-gray-400">
              Connect. Learn. Build Together.
            </p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }, i) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:translate-x-1 active:scale-[0.97] motion-reduce:transform-none ${
                  active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400 transition-all duration-300 ease-out ${
                    active ? "h-5" : "group-hover:h-3"
                  }`}
                />
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 1.8}
                  className="shrink-0 transition-transform duration-200 ease-out group-hover:scale-125 group-hover:-rotate-6 motion-reduce:transform-none"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="group mt-auto rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-gray-900 hover:shadow-xl hover:shadow-indigo-950/30 motion-reduce:transform-none">
          <h3 className="text-sm font-semibold text-white">
            Good developers build better together.
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
            Join a community. Share knowledge. Grow your career.
          </p>
          <Link
            href="/create"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 active:scale-95 motion-reduce:transform-none"
          >
            Create Post
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 px-1 text-xs text-gray-600 transition-colors duration-200 hover:text-gray-400">
          <span>DevCommunity</span>
          <span>v1.0.0</span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
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
              className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[9px] font-medium transition-all duration-200 ease-out active:scale-90 sm:text-[10px] motion-reduce:transform-none ${
                active
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute -top-2 left-1/2 h-[3px] -translate-x-1/2 rounded-b-full bg-indigo-400 transition-all duration-300 ease-out ${
                  active ? "w-6 opacity-100" : "w-0 opacity-0"
                }`}
              />
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={`transition-transform duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:transform-none ${
                  active ? "scale-110" : ""
                }`}
              />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense
      fallback={
        <div className="hidden h-screen w-60 shrink-0 animate-pulse border-r border-gray-800 bg-gray-950 md:block" />
      }
    >
      <SidebarNavigation />
    </Suspense>
  );
}