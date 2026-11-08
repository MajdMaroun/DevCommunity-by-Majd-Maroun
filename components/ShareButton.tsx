"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Mail, Send, Share2 } from "lucide-react";

type Props = {
  path: string;
  title: string;
};

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      {children}
    </svg>
  );
}

const WhatsAppIcon = () => (
  <Svg>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </Svg>
);

const XIcon = () => (
  <Svg>
    <path d="M4 4l16 16" />
    <path d="M20 4L4 20" />
  </Svg>
);

const LinkedInIcon = () => (
  <Svg>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
);

const FacebookIcon = () => (
  <Svg>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);

function legacyCopy(text: string) {
  const area = document.createElement("textarea");

  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";

  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

export default function ShareButton({ path, title }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position
  function updatePosition() {
    const button = ref.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const menuWidth = 256;
    const menuHeight = 390;
    const spacing = 8;
    const padding = 16;

    let left = rect.left;

    // Prevent horizontal overflow
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - menuWidth - padding)
    );

    // Open above if there isn't enough room below
    let top = rect.bottom + spacing;

    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - menuHeight - spacing;
    }

    // Keep inside viewport
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - menuHeight - padding)
    );

    setPosition({ top, left });
  }

  // Close outside click and Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;

      if (
        ref.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onScroll = () => updatePosition();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  async function onShareClick() {
    if (open) {
      setOpen(false);
      return;
    }

    const fullUrl = `${window.location.origin}${path}`;

    // Native sharing on mobile devices
    const isTouchDevice = window.matchMedia(
      "(pointer: coarse)"
    ).matches;

    if (isTouchDevice && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: title,
          url: fullUrl,
        });

        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    setUrl(fullUrl);
    updatePosition();
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      legacyCopy(url);
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);

  const options = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(
        `${title} ${url}`
      )}`,
      icon: <WhatsAppIcon />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${link}`,
      icon: <XIcon />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
      icon: <LinkedInIcon />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
      icon: <FacebookIcon />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${link}&text=${text}`,
      icon: <Send className="h-[18px] w-[18px]" />,
    },
    {
      label: "Email",
      href: `mailto:?subject=${text}&body=${encodeURIComponent(
        `I thought you might like this post: ${url}`
      )}`,
      icon: <Mail className="h-[18px] w-[18px]" />,
    },
  ];

  const row =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-900";

  const iconBox =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-slate-300 ring-1 ring-slate-800";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onShareClick}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Share this post"
        className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
          open
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
        }`}
      >
        <Share2 className="h-5 w-5" />
        Share
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 999999,
            }}
            className="w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-150"
          >
            <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Share this post
            </p>

            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className={row}
            >
              <span className={iconBox}>
                {copied ? (
                  <Check className="h-[18px] w-[18px] text-green-400" />
                ) : (
                  <Link2 className="h-[18px] w-[18px]" />
                )}
              </span>

              <span className="font-medium">
                {copied ? "Link copied" : "Copy link"}
              </span>
            </button>

            {options.map((option) => (
              <a
                key={option.label}
                role="menuitem"
                href={option.href}
                target={
                  option.href.startsWith("mailto:")
                    ? undefined
                    : "_blank"
                }
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={row}
              >
                <span className={iconBox}>
                  {option.icon}
                </span>

                <span className="font-medium">
                  {option.label}
                </span>
              </a>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}