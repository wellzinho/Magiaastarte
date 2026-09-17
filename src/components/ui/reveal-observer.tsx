"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reveal = (el: Element) => el.classList.add("is-visible");
    const revealAll = () => nodes.forEach(reveal);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(el);
      } else {
        observer.observe(el);
      }
    });

    document.documentElement.classList.add("reveal-armed");
    const fallback = window.setTimeout(revealAll, 1800);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
      document.documentElement.classList.remove("reveal-armed");
    };
  }, []);

  return null;
}
