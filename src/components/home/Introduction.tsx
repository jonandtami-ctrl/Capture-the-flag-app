import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";

export default function Introduction() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-forest sm:text-4xl">
              Helping People Encounter Jesus and Live Spirit-Led Lives
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal-light">
              <p>
                For more than 20 years, we have had the privilege of serving
                in missions, local churches, pastoral ministry, leadership
                development, inner healing, and prophetic ministry.
              </p>
              <p>
                Our passion is to help people encounter the love of Jesus,
                confidently recognize His voice, receive healing, and become
                equipped to walk in the purpose God has for their lives.
              </p>
              <p>
                Everything we do is centred on Jesus, grounded in Scripture,
                and dependent on the Holy Spirit.
              </p>
              <p>
                Our goal is not to make people dependent on us. Our desire is
                to help people grow in their own relationship with God and
                become confident in hearing and following Him.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <blockquote className="mx-auto mt-12 max-w-xl rounded-3xl bg-beige/50 px-8 py-8">
              <p className="font-serif text-xl italic text-forest sm:text-2xl">
                &ldquo;My sheep hear My voice, and I know them, and they
                follow Me.&rdquo;
              </p>
              <cite className="mt-3 block text-sm not-italic tracking-wide text-gold-dark">
                — John 10:27
              </cite>
            </blockquote>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
