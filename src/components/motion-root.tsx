"use client";

import { useEffect } from "react";

/**
 * Adds `.js` (so no-JS visitors keep content visible) and drives reveal-on-scroll
 * via one IntersectionObserver instead of per-element scroll handlers.
 *
 * A MutationObserver re-observes any [data-reveal] node added later: client-side
 * navigation renders new nodes after this effect ran once, and without this they
 * would stay at opacity 0 forever (the "blank /projects page" bug).
 */
export function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((n) => n.setAttribute("data-shown", "true"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "true");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const observe = (node: HTMLElement) => {
      if (!node.hasAttribute("data-shown")) io.observe(node);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(observe);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.hasAttribute("data-reveal")) observe(node);
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(observe);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
