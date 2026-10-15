"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

// Edit your links here. Delete an entry to remove it from the menu.
const CONTACTS = [
  {
    key: "instagram",
    label: "Instagram",
    sub: "@majd_maroun",
    href: "https://www.instagram.com/majd_maroun/",
    hover: "group-hover:text-pink-400",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    sub: "Majd Maroun",
    href: "https://www.linkedin.com/in/majd-maroun-193863378",
    hover: "group-hover:text-sky-400",
  },
  {
    key: "github",
    label: "GitHub",
    sub: "@MajdMaroun",
    href: "https://github.com/MajdMaroun",
    hover: "group-hover:text-white",
  },
  {
    key: "gmail",
    label: "Gmail",
    sub: "majdmaroun24@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&to=majdmaroun24@gmail.com",
    hover: "group-hover:text-red-400",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    // The number is only inside the link, it is not printed on the page
    sub: "Send me a message",
    href: "https://wa.me/96181740994?text=Hi%20Majd%2C%20I%20found%20you%20through%20DevCommunity",
    hover: "group-hover:text-green-400",
  },
] as const;

type ContactKey = (typeof CONTACTS)[number]["key"];

function BrandIcon({ name, className = "" }: { name: ContactKey; className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  if (name === "instagram") {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg {...props}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  if (name === "gmail") {
  return (
    <svg {...props}>
      <path d="M3 6l9 7 9-7" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </svg>
  );
}

  return (
    <svg {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

export default function Footer() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <footer className="border-t border-slate-800 bg-slate-950/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2.5 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:gap-3 sm:px-6 lg:px-8">
        <span>Made by</span>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium transition ${
              open
                ? "border-indigo-500/60 bg-slate-900 text-white"
                : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white"
            }`}
          >
            Majd Maroun
            <ChevronUp
              size={15}
              className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`}
            />
          </button>

          {/* Opens upward, because the footer sits at the bottom of the page */}
          {open && (
            <div
              role="menu"
              className="absolute bottom-full left-1/2 z-50 mb-3 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/50"
            >
              <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Get in touch
              </p>

              {CONTACTS.map((c) => (
                <a
                  key={c.key}
                  role="menuitem"
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-900"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-slate-300 ring-1 ring-slate-800 transition group-hover:ring-slate-700">
                    <BrandIcon
                      name={c.key}
                      className={`h-[18px] w-[18px] transition ${c.hover}`}
                    />
                  </span>

                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium text-white">{c.label}</span>
                    <span className="block truncate text-xs text-slate-500">{c.sub}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}