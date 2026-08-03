import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "About Jon and Tami Masson",
  description:
    "Learn about Jon and Tami Masson's journey in missions, pastoral ministry, prophetic ministry, and inner healing spanning more than 15 years.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-beige/40 py-20 sm:py-28">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Our Story</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl">
              Meet Jon and Tami
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-light">
              Two hearts devoted to helping people encounter Jesus, hear His
              voice, and walk in freedom.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <FadeIn>
              <ImagePlaceholder
                label="Photo of Jon and Tami Masson"
                className="aspect-[4/5] w-full lg:sticky lg:top-28"
              />
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="space-y-6 leading-relaxed text-charcoal-light">
                <p>
                  Jon and Tami Masson have served together in missions,
                  ministry, leadership, and pastoral care for more than 15
                  years.
                </p>
                <p>
                  Their ministry journey has included inner-city ministry in
                  Toronto, serving with Youth With A Mission in the United
                  States and Canada, leadership development, prophetic
                  ministry, prayer, discipleship, inner healing, and
                  strengthening local churches.
                </p>
                <p>
                  Jon carries a passion for prophetic ministry, intercession,
                  hearing God&apos;s voice, spiritual discernment, and
                  helping believers recognize how God communicates with
                  them.
                </p>
                <p>
                  Tami carries a passion for inner healing, healthy
                  leadership, identity, emotional wholeness, and helping
                  people experience the restoring love of Jesus.
                </p>
                <p>
                  Together, they desire to create safe, joyful, and
                  biblically grounded spaces where people can encounter God,
                  receive encouragement, experience healing, and become
                  equipped to serve others.
                </p>
                <p className="font-serif text-xl italic text-forest">
                  Their heart is to strengthen the local church rather than
                  build a ministry around themselves.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button href="/prophetic-sessions">
                  Request a Ministry Session
                </Button>
                <Button href="/invite-us" variant="secondary">
                  Invite Us to Teach
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
