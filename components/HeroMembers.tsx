"use client";

import { useEffect, useState } from "react";

function pickThree(): string[] {
  const seen = new Set<string>();
  while (seen.size < 3) {
    const gender = Math.random() < 0.5 ? "men" : "women";
    const id = Math.floor(Math.random() * 100); // portraits 0-99
    seen.add(`https://randomuser.me/api/portraits/${gender}/${id}.jpg`);
  }
  return [...seen];
}

export default function HeroMembers() {
  const [photos, setPhotos] = useState<string[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setPhotos(pickThree()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex -space-x-2">
      {(photos ?? [null, null, null]).map((src, i) =>
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full border-2 border-[#101116] object-cover"
          />
        ) : (
          <span
            key={i}
            className="h-7 w-7 animate-pulse rounded-full border-2 border-[#101116] bg-slate-700"
          />
        )
      )}
    </div>
  );
}