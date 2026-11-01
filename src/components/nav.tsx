"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navItems, profile } from "@/content/profile";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line/70 bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Main">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-sm font-medium tracking-tight text-fg"
        >
          Kelvin Tan<span className="text-cyan">.</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[0.8125rem] text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full border border-line px-4 py-1.5 text-[0.8125rem] text-fg transition-colors hover:border-cyan/60 hover:text-cyan"
            >
              Email
            </a>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full border border-line text-fg md:hidden"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-ink md:hidden">
          <ul className="container-x flex flex-col py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-lg font-display text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
