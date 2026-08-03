import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function AboutPreview() {
  return (
    <section className="bg-beige/40 py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <FadeIn>
            <ImagePlaceholder
              label="Photo of Jon and Tami Masson"
              className="aspect-[4/5] w-full"
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-forest sm:text-4xl">
              Meet Jon and Tami
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-charcoal-light">
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
                hearing God&apos;s voice, spiritual discernment, and helping
                believers recognize how God communicates with them.
              </p>
              <p>
                Tami carries a passion for inner healing, healthy leadership,
                identity, emotional wholeness, and helping people experience
                the restoring love of Jesus.
              </p>
              <p>
                Together, they desire to create safe, joyful, and biblically
                grounded spaces where people can encounter God, receive
                encouragement, experience healing, and become equipped to
                serve others.
              </p>
              <p>
                Their heart is to strengthen the local church rather than
                build a ministry around themselves.
              </p>
            </div>
            <Button href="/about" variant="secondary" className="mt-8">
              Read Our Story
            </Button>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
