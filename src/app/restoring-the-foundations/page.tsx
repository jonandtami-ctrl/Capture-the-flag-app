import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import RestoringFoundationsForm from "@/components/forms/RestoringFoundationsForm";

export const metadata: Metadata = {
  title: "Restoring the Foundations",
  description:
    "Apply for a Restoring the Foundations session — a structured prayer ministry approach to help identify and address spiritual, emotional, and relational areas affecting your freedom.",
};

export default function RestoringTheFoundationsPage() {
  return (
    <>
      <section className="bg-beige/40 py-20 sm:py-28">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Restoring the Foundations</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl">
              Apply for a Restoring the Foundations Session
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-light">
              Restoring the Foundations is a structured prayer ministry
              approach designed to help people identify and address
              spiritual, emotional, and relational areas that may be
              affecting their freedom. Sessions provide a safe, prayerful
              environment where participants can invite Jesus into places of
              pain, receive truth, and move toward greater healing and
              wholeness.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              <div className="card">
                <RestoringFoundationsForm />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
