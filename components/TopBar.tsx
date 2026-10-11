"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@/components/Avatar"

export default function Topbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search (avoids a request on every keystroke)
  useEffect(() => {
    if (!search.trim()) return;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      console.log(data);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleNotificationsClick = () => {
    setNotifOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    setMenuOpen((prev) => !prev);
    setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950/80 px-6 py-3 backdrop-blur">
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-400">
        <Search size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities, blogs, people..."
          className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotificationsClick}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative text-gray-400 hover:text-white"
          >
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-72 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-xl">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
                Notifications
              </p>
              <div className="px-3 py-4 text-sm text-gray-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {status === "loading" ? (
          // Skeleton while the session loads
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-800" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
          </div>
        ) : !user ? (
          <button
            onClick={() => signIn()}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Sign in
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleProfileClick}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 text-sm text-white"
            >
             <Avatar name={user.name} image={user.image} size={32} />

              <span className="hidden sm:inline">{user.name ?? user.email}</span>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-48 rounded-lg border border-gray-800 bg-gray-900 py-1 text-sm shadow-xl"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}