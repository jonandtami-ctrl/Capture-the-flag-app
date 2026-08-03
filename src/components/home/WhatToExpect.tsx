import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig } from "@/lib/site-config";

export default function WhatToExpect() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
            What You Can Expect
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.whatToExpect.map((item, i) => (
            <FadeIn key={item.step} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl border border-beige-dark/40 bg-white/70 p-8 shadow-card">
                <span className="font-serif text-4xl font-semibold text-gold">
                  {item.step}
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-forest">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-light">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
