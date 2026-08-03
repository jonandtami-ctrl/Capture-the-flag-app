import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";

const principles = [
  "Test what is shared",
  "Compare it with Scripture",
  "Pray through it personally",
  "Seek confirmation from trusted spiritual leaders",
  "Take responsibility for their own decisions",
];

export default function SafetyAccountability() {
  return (
    <section className="bg-beige/40 py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
              Safe, Biblical and Accountable Ministry
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-8 space-y-5 text-left leading-relaxed text-charcoal-light">
              <p>
                We believe prophetic and prayer ministry should be carried
                out with humility, love, wisdom, and accountability.
              </p>
              <p>
                We do not use fear, manipulation, control, pressure, or
                spiritual authority to make decisions for people.
              </p>
              <p>We encourage everyone receiving ministry to:</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <ul className="mx-auto mt-6 max-w-lg space-y-3 text-left">
              {principles.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-1 h-5 w-5 flex-shrink-0 text-gold"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                  <span className="text-charcoal-light">{p}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 leading-relaxed text-charcoal-light">
              Prophetic ministry does not replace Scripture, medical care,
              professional counselling, legal advice, financial advice, or
              pastoral oversight.
            </p>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
