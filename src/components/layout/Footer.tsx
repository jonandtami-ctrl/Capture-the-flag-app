import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import Container from "@/components/ui/Container";

const socialLinks = [
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    icon: (
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.97.24 2.43.42.61.24 1.05.52 1.51.98.46.46.74.9.98 1.51.18.46.36 1.26.42 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.97-.42 2.43-.24.61-.52 1.05-.98 1.51-.46.46-.9.74-1.51.98-.46.18-1.26.36-2.43.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.97-.24-2.43-.42a4.1 4.1 0 0 1-1.51-.98 4.1 4.1 0 0 1-.98-1.51c-.18-.46-.36-1.26-.42-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.24-1.97.42-2.43.24-.61.52-1.05.98-1.51.46-.46.9-.74 1.51-.98.46-.18 1.26-.36 2.43-.42C8.42 2.21 8.8 2.2 12 2.2Zm0 3.15a6.65 6.65 0 1 0 0 13.3 6.65 6.65 0 0 0 0-13.3Zm0 10.97a4.32 4.32 0 1 1 0-8.64 4.32 4.32 0 0 1 0 8.64Zm6.9-11.22a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0Z" />
    ),
  },
  {
    label: "Facebook",
    href: siteConfig.social.facebook,
    icon: (
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.3 4.2 15.3 4.1 14.15 4.1c-2.37 0-4 1.45-4 4.1v2.4H7.6v3h2.55V21h3.35Z" />
    ),
  },
  {
    label: "YouTube",
    href: siteConfig.social.youtube,
    icon: (
      <path d="M21.6 7.6a2.8 2.8 0 0 0-1.97-2C18 5.1 12 5.1 12 5.1s-6 0-7.63.5a2.8 2.8 0 0 0-1.97 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.4 2.8 2.8 0 0 0 1.97 2c1.63.5 7.63.5 7.63.5s6 0 7.63-.5a2.8 2.8 0 0 0 1.97-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.4ZM9.9 15.1V8.9l5.3 3.1-5.3 3.1Z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-cream/90">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <h2 className="font-serif text-2xl font-semibold text-cream">
              {siteConfig.ministryName}
            </h2>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-gold-light">
              Ministry
            </p>
            <p className="mt-4 text-cream/70">
              Helping people hear God&apos;s voice, experience healing, and
              walk in freedom.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold-light"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light">
              Navigate
            </h3>
            <ul className="mt-4 space-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/75 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-light">
              Ministry
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-cream/75 transition-colors hover:text-cream"
                >
                  Contact
                </Link>
              </li>
              {siteConfig.footerLegalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/75 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/15 pt-8 text-sm text-cream/60">
          &copy; {new Date().getFullYear()} {siteConfig.ministryName}. All
          rights reserved.
        </div>
      </Container>
    </footer>
  );
}
