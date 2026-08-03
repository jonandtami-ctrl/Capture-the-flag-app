import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import ContactForm from "@/components/forms/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Jon and Tami Masson Ministry with questions about prophetic sessions, Restoring the Foundations, or speaking invitations.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-beige/40 py-20 sm:py-28">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Contact</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl">
              We&apos;d Love to Hear From You
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-light">
              For general questions, reach out below. If you are requesting
              ministry or a speaking engagement, please use the dedicated
              forms for a faster response.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_1.3fr]">
            <FadeIn>
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-forest">
                    Email
                  </h2>
                  <p className="mt-1 text-charcoal-light">
                    {siteConfig.contactEmail}
                  </p>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-forest">
                    Ministry Requests
                  </h2>
                  <p className="mt-1 text-charcoal-light">
                    For prophetic sessions, Restoring the Foundations, or
                    speaking invitations, please use the dedicated request
                    forms so we can respond with the right information.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="card">
                <ContactForm />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
