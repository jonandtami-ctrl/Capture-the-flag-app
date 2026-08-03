"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { siteConfig } from "@/lib/site-config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-cream/90 shadow-soft backdrop-blur-md"
          : "bg-cream/40 backdrop-blur-sm"
      )}
    >
      <nav className="container-page flex items-center justify-between py-4">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-forest sm:text-2xl"
        >
          {siteConfig.ministryName}
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "text-sm font-medium tracking-wide text-charcoal-light transition-colors hover:text-forest",
                  pathname === item.href && "text-forest"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link href={siteConfig.ctaHref} className="btn-primary !px-6 !py-3">
            {siteConfig.ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-forest lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-7 w-7"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-beige-dark/40 bg-cream lg:hidden"
          >
            <ul className="container-page flex flex-col gap-1 py-4">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "block rounded-xl px-3 py-3 text-base font-medium text-charcoal-light transition-colors hover:bg-beige/60 hover:text-forest",
                      pathname === item.href && "text-forest"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href={siteConfig.ctaHref}
                  className="btn-primary w-full"
                >
                  {siteConfig.ctaLabel}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
