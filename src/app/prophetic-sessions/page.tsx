import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import PropheticSessionForm from "@/components/forms/PropheticSessionForm";
import { FormNote } from "@/components/forms/FormElements";

export const metadata: Metadata = {
  title: "Prophetic Ministry Sessions",
  description:
    "Request a prophetic ministry session with Jon and Tami Masson — personal prophetic encouragement, prayer, and biblical insight in a safe environment.",
};

export default function PropheticSessionsPage() {
  return (
    <>
      <section className="bg-beige/40 py-20 sm:py-28">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Prophetic Ministry Sessions</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl">
              Request a Prophetic Session
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-light">
              Receive personal prophetic encouragement, prayer, and biblical
              insight in a safe and caring environment. During the session,
              our team will prayerfully listen to the Lord and share what we
              sense He may be highlighting for your encouragement,
              strengthening, and comfort.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl space-y-8">
            <FadeIn>
              <FormNote>
                Prophetic ministry is intended to encourage and strengthen
                your relationship with God. It is not a replacement for
                Scripture, pastoral care, professional counselling, medical
                advice, or personal responsibility.
              </FormNote>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="card">
                <PropheticSessionForm />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
