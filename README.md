# Jon and Tami Masson Ministry Website

A warm, modern website for a prophetic and inner-healing ministry, built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, React Hook Form, and Zod.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Email Notifications (Resend)

Form submissions (Prophetic Session, Restoring the Foundations, Invite Us, Contact) are emailed via [Resend](https://resend.com). Without configuration, submissions are just logged to the server console — the forms still work, but nothing gets emailed.

To enable real emails:

1. Create a free account at [resend.com](https://resend.com) and generate an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. Copy `.env.local.example` to `.env.local`.
3. Fill in:
   - `RESEND_API_KEY` — the key from step 1.
   - `MINISTRY_NOTIFICATION_EMAIL` — the inbox that should receive submissions (e.g. `jonandtami@gmail.com`).
   - `MINISTRY_FROM_EMAIL` — leave blank at first. Resend's shared `onboarding@resend.dev` sender works out of the box and can deliver to any inbox. Once you verify your own domain in Resend, set this to something like `forms@yourministrydomain.org` for better deliverability and branding.
4. On your hosting platform (e.g. Vercel), add the same three variables under the project's Environment Variables settings — `.env.local` only applies locally and is never committed.

Each notification email's reply-to address is set to the form submitter's email, so you can hit "Reply" directly.

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
- Set the `RESEND_API_KEY` / `MINISTRY_NOTIFICATION_EMAIL` environment variables on your hosting platform (see "Email Notifications" above) so form emails actually send in production.
- Verify a sending domain in Resend and set `MINISTRY_FROM_EMAIL` for better deliverability than the shared `onboarding@resend.dev` sender.
- Add a real analytics snippet in `src/app/layout.tsx`.
- Add real spam protection (e.g. Cloudflare Turnstile/hCaptcha) alongside the honeypot fields already in place.
- Have the Privacy Policy and Ministry Disclaimer pages reviewed by a qualified professional.
