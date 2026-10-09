"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleNotificationsClick = () => {
    setNotifOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    setMenuOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const [search, setSearch] = useState("");

const handleSearch = async (value: string) => {
  setSearch(value);

  if (!value.trim()) return;

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(value)}`
  );

  const data = await response.json();

  console.log(data);
};

const [user, setUser] = useState({
  name: "Majd Maroun",
});

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950/80 px-6 py-3 backdrop-blur">
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-400">
        <Search size={16} />
        <input type="text"
               value={search}
               onChange={(e) => handleSearch(e.target.value)}
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleProfileClick}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 text-sm text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold">
  {user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)}
</div>

{user.name}
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
                onClick={() => router.push("/profile")}
                className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Profile
              </button>
              <button
                role="menuitem"
                onClick={() => router.push("/settings")}
                className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Settings
              </button>
              <button
                role="menuitem"
                onClick={() => console.log("Log out")}
                className="block w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}