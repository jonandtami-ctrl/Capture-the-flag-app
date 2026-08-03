import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import InviteUsForm from "@/components/forms/InviteUsForm";

export const metadata: Metadata = {
  title: "Invite Us to Teach",
  description:
    "Invite Jon and Tami Masson to teach at your church, ministry school, conference, leadership gathering, small group, or community event.",
};

export default function InviteUsPage() {
  return (
    <>
      <section className="bg-beige/40 py-20 sm:py-28">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Teaching and Equipping</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl">
              Invite Jon and Tami to Teach
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-light">
              Invite Jon and Tami to teach at your church, ministry school,
              conference, leadership gathering, small group, or community
              event. Our teaching is practical, biblical, interactive, and
              designed to help people grow in confidence while maintaining
              healthy spiritual discernment and accountability.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              <div className="card">
                <InviteUsForm />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
