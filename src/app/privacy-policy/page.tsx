import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.ministryName} Ministry.`,
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-forest">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-charcoal-light">
            Last updated: {new Date().getFullYear()}
          </p>

          <div className="prose-content mt-10 space-y-8 leading-relaxed text-charcoal-light">
            <p>
              This Privacy Policy is a placeholder and should be reviewed by
              a qualified professional before this website launches
              publicly. It explains, in general terms, how {siteConfig.ministryName}{" "}
              Ministry (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) collects, uses, and protects information
              submitted through this website.
            </p>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Information We Collect
              </h2>
              <p className="mt-3">
                When you submit a request through one of our forms —
                including a Prophetic Session request, a Restoring the
                Foundations application, an Invite Us request, or a general
                Contact message — we may collect information such as your
                name, email address, phone number, city and country,
                church or ministry affiliation, and any details you choose
                to share about your ministry request, including prayer
                requests or sensitive personal information.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                How We Use Your Information
              </h2>
              <p className="mt-3">
                We use the information you provide solely to review your
                request, respond to you, schedule sessions or engagements,
                and provide the ministry care or teaching you have
                requested. We do not sell your information to third
                parties.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Confidentiality
              </h2>
              <p className="mt-3">
                Information shared during ministry sessions, including
                prayer requests and personal history, is treated with care
                and discretion. Details are shared only with those directly
                involved in providing your ministry care, except where
                disclosure is required by law or necessary to protect
                someone&apos;s safety.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Data Storage and Security
              </h2>
              <p className="mt-3">
                We take reasonable steps to protect the information you
                submit. However, no method of electronic storage or
                transmission is completely secure, and we cannot guarantee
                absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Your Choices
              </h2>
              <p className="mt-3">
                You may contact us at any time to ask what information we
                hold about you, request corrections, or request that your
                information be deleted, subject to any legal or
                record-keeping requirements.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Contact
              </h2>
              <p className="mt-3">
                If you have questions about this Privacy Policy, please
                contact us at {siteConfig.contactEmail}.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
