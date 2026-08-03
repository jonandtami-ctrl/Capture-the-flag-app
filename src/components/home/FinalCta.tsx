import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-forest py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-forest via-forest-dark to-forest-dark" />
      <Container className="relative text-center">
        <FadeIn>
          <h2 className="font-serif text-3xl font-semibold text-cream sm:text-4xl">
            Ready to Take the Next Step?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/85">
            Whether you are looking for prophetic encouragement, deeper
            healing, or practical teaching for your church or ministry, we
            would be honoured to connect with you.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/prophetic-sessions" variant="primary-inverse">
              Request a Session
            </Button>
            <Button href="/invite-us" variant="secondary-inverse">
              Invite Us to Teach
            </Button>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
