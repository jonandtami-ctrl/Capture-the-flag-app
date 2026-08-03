import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/lib/site-config";

// NOTE: The testimonials below are placeholders (see siteConfig.testimonials
// in src/lib/site-config.ts). They must be replaced with real, approved
// testimonies before this site launches publicly.
export default function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
            Stories of Encouragement and Transformation
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {siteConfig.testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <figure className="card flex h-full flex-col justify-between">
                <blockquote>
                  <p className="font-serif text-lg italic leading-relaxed text-forest">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-sm font-medium uppercase tracking-wide text-gold-dark">
                  {t.name}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
