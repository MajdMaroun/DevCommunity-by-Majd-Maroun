"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
children: ReactNode;
className?: string;
delay?: number;
};

export default function Reveal({
children,
className = "",
delay = 0,
}: RevealProps) {
const ref = useRef<HTMLDivElement>(null);
const [visible, setVisible] = useState(false);

useEffect(() => {
const element = ref.current;

if (!element) return;

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (reduceMotion) {
  setVisible(true);
  return;
}

const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      setVisible(true);
      observer.disconnect();
    }
  },
  {
    threshold: 0.08,
    rootMargin: "0px 0px 30px 0px",
  }
);

observer.observe(element);

return () => observer.disconnect();

}, []);

return (
<div
ref={ref}
className={[
className,
"motion-reduce:transform-none motion-reduce:opacity-100",
"transition-[opacity,transform] duration-500 ease-out",
visible
? "translate-y-0 opacity-100"
: "translate-y-3 opacity-0",
].join(" ")}
style={{
transitionDelay: visible ? `${Math.min(delay, 300)}ms` : "0ms",
}}
>
{children} </div>
);
}
