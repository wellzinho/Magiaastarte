"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]";

export function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => {
      el.classList.remove("reveal-pending");
      el.classList.add("is-visible");
    };
    const revealAll = () =>
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(reveal);

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

    const track = (el: HTMLElement) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(el);
      } else {
        el.classList.add("reveal-pending");
        observer.observe(el);
      }
    };

    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(track);
    document.documentElement.classList.add("reveal-armed");

    // Elements that enter the DOM later (re-renders, hot reload) must not stay hidden.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(SELECTOR)) track(node);
          node.querySelectorAll<HTMLElement>(SELECTOR).forEach(track);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    const fallback = window.setTimeout(revealAll, 1800);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
      mutations.disconnect();
      document.documentElement.classList.remove("reveal-armed");
      // Never leave anything hidden behind when the observer unmounts (e.g. hot reload).
      document
        .querySelectorAll<HTMLElement>(".reveal-pending")
        .forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, []);

  return null;
}
