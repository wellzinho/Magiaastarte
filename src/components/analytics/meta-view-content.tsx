"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __META_PIXEL_PAGEVIEW__?: boolean;
  }
}

let viewContentSent = false;

export function MetaViewContent() {
  useEffect(() => {
    if (viewContentSent) {
      return;
    }

    const send = () => {
      if (viewContentSent) {
        return;
      }
      if (typeof window.fbq !== "function") {
        return false;
      }
      viewContentSent = true;
      window.fbq("track", "ViewContent");
      return true;
    };

    if (send()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (send()) {
        window.clearInterval(intervalId);
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
