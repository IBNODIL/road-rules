"use client";

import { useEffect, useRef } from "react";

/** Each word lights up as it crosses a trigger line, in reading order. */
export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const words = root.current?.querySelectorAll<HTMLElement>("[data-w]");
    if (!words) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const line = e.rootBounds ? e.rootBounds.bottom : window.innerHeight * 0.6;
          (e.target as HTMLElement).dataset.on = String(e.boundingClientRect.top < line);
        }
      },
      { rootMargin: "0px 0px -40% 0px", threshold: [0, 1] },
    );
    words.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  return (
    <p ref={root} className={className}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          data-w
          data-on="false"
          className="inline-block opacity-30 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] data-[on=true]:opacity-100"
          style={{ transitionDelay: `${(i % 6) * 40}ms` }}
        >
          {w}
          {" "}
        </span>
      ))}
    </p>
  );
}
