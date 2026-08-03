import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.ministryName} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.ministryName}`,
  },
  description: siteConfig.description,
  keywords: [
    "prophetic ministry",
    "hearing God's voice",
    "inner healing",
    "Restoring the Foundations",
    "Christian ministry",
    "identity in Christ",
    "prophetic training",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: `${siteConfig.ministryName} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.ministryName,
    // Placeholder OG image — replace with a real 1200x630 JPG/PNG before launch.
    images: [
      {
        url: "/images/og-placeholder.svg",
        width: 1200,
        height: 630,
        alt: siteConfig.ministryName,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.ministryName} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/og-placeholder.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {/*
        Analytics placeholder: add your analytics script (e.g. Plausible,
        Google Analytics, Fathom) here once an account is set up.
      */}
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-6 focus:py-3 focus:text-cream"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
