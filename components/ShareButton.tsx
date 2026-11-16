"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Mail, Share2 } from "lucide-react";

import {
  siWhatsapp,
  siInstagram,
  siFacebook,
  siX,
  siTelegram,
} from "simple-icons";

import type { SimpleIcon } from "simple-icons";

type Props = {
  path: string;
  title: string;
};

// Reusable brand SVG
function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

// LinkedIn official logo
const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GmailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px]"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 6.5L12 13l9-6.5"
      stroke="#EA4335"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6.5V18"
      stroke="#4285F4"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M21 6.5V18"
      stroke="#34A853"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M3 6.5L12 13l9-6.5"
      stroke="#FBBC04"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Fallback copy function
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
    const menuHeight = 430;
    const spacing = 8;
    const padding = 16;

    let left = rect.left;

    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - menuWidth - padding)
    );

    let top = rect.bottom + spacing;

    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - menuHeight - spacing;
    }

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

  // Share button
  async function onShareClick() {
    if (open) {
      setOpen(false);
      return;
    }

    const fullUrl = `${window.location.origin}${path}`;

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

  // Copy link
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

  // Social sharing options
  const options = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(
        `${title} ${url}`
      )}`,
      icon: <BrandIcon icon={siWhatsapp} />,
      color: "#25D366",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/",
      icon: <BrandIcon icon={siInstagram} />,
      color: "#E4405F",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
      icon: <BrandIcon icon={siFacebook} />,
      color: "#0866FF",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${link}`,
      icon: <BrandIcon icon={siX} />,
      color: "#FFFFFF",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
      icon: <LinkedInIcon />,
      color: "#0A66C2",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${link}&text=${text}`,
      icon: <BrandIcon icon={siTelegram} />,
      color: "#26A5E4",
    },
    {
      label: "Email",
      href: `mailto:?subject=${text}&body=${encodeURIComponent(
        `I thought you might like this post: ${url}`
      )}`,
      icon: <Mail className="h-[18px] w-[18px]" />,
      color: "#CBD5E1",
    },
  ];

  const row =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-900";

  const iconBox =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 ring-1 ring-slate-800";

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
              <span className={`${iconBox} text-slate-300`}>
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
                <span
                  className={iconBox}
                  style={{ color: option.color }}
                >
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