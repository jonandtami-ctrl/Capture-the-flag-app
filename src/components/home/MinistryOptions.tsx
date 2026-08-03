import Container from "@/components/ui/Container";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";

const options = [
  {
    title: "Prophetic Ministry Sessions",
    description:
      "Receive personal prophetic encouragement, prayer, and biblical insight in a safe and caring environment. During the session, our team will prayerfully listen to the Lord and share what we sense He may be highlighting for your encouragement, strengthening, and comfort.",
    note: "Prophetic ministry is intended to encourage and strengthen your relationship with God. It is not a replacement for Scripture, pastoral care, professional counselling, medical advice, or personal responsibility.",
    href: "/prophetic-sessions",
    cta: "Request a Prophetic Session",
  },
  {
    title: "Restoring the Foundations",
    description:
      "Restoring the Foundations is a structured prayer ministry approach designed to help people identify and address spiritual, emotional, and relational areas that may be affecting their freedom. Sessions provide a safe, prayerful environment where participants can invite Jesus into places of pain, receive truth, and move toward greater healing and wholeness.",
    note: null,
    href: "/restoring-the-foundations",
    cta: "Apply for a Session",
  },
  {
    title: "Teaching and Equipping",
    description:
      "Invite Jon and Tami to teach at your church, ministry school, conference, leadership gathering, small group, or community event. Our teaching is practical, biblical, interactive, and designed to help people grow in confidence while maintaining healthy spiritual discernment and accountability.",
    note: null,
    href: "/invite-us",
    cta: "Invite Us to Teach",
  },
];

export default function MinistryOptions() {
  return (
    <section className="bg-beige/40 py-24 sm:py-32">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-forest sm:text-4xl">
            How We Can Serve You
          </h2>
        </FadeIn>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {options.map((option, i) => (
            <FadeIn key={option.title} delay={i * 0.12}>
              <div className="card flex h-full flex-col">
                <h3 className="font-serif text-2xl font-semibold text-forest">
                  {option.title}
                </h3>
                <p className="mt-4 flex-1 leading-relaxed text-charcoal-light">
                  {option.description}
                </p>
                {option.note && (
                  <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm leading-relaxed text-charcoal-light/80">
                    {option.note}
                  </p>
                )}
                <Button
                  href={option.href}
                  variant="secondary"
                  className="mt-8 w-full"
                >
                  {option.cta}
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
