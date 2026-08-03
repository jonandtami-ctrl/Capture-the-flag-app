# Jon and Tami Masson Ministry Website

A warm, modern website for a prophetic and inner-healing ministry, built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, React Hook Form, and Zod.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Editing Content

- **Ministry name, contact info, navigation, testimonials, teaching topics:** `src/lib/site-config.ts`
- **Colors and fonts:** `tailwind.config.ts` (colors) and `src/app/layout.tsx` (fonts)
- **Page copy:** `src/app/**/page.tsx` and the section components in `src/components/home/`
- **Photos:** replace `ImagePlaceholder` usages in `src/components/home/`, `src/app/about/page.tsx`, and the `Hero` component with real `next/image` photos once available
- **Form fields/validation:** `src/lib/validation/*.ts`
- **Form submission handling:** `src/app/api/*/route.ts` and `src/lib/email.ts` (wire up a real email/CRM integration before launch)

## Before Launch

- Replace placeholder testimonials in `src/lib/site-config.ts` with real, approved testimonies.
- Replace photo placeholders with final photography.
- Wire up `src/lib/email.ts` to a real email/CRM provider.
- Add a real analytics snippet in `src/app/layout.tsx`.
- Add real spam protection (e.g. Cloudflare Turnstile/hCaptcha) alongside the honeypot fields already in place.
- Have the Privacy Policy and Ministry Disclaimer pages reviewed by a qualified professional.
