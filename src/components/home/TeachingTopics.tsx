import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/lib/site-config";

export default function TeachingTopics() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
            Teaching and Ministry Topics
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {siteConfig.teachingTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-gold/40 bg-white px-5 py-2.5 text-sm font-medium text-forest shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-card"
              >
                {topic}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-12 max-w-2xl text-center leading-relaxed text-charcoal-light">
            Sessions can be designed for weekend events, church services,
            ministry schools, leadership teams, youth and young adult
            gatherings, small groups, or multi-session training programs.
          </p>
        </FadeIn>
      </Container>
    </section>
  );
}
