import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Ministry Disclaimer",
  description: `Ministry Disclaimer for ${siteConfig.ministryName} Ministry.`,
};

export default function MinistryDisclaimerPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-forest">
            Ministry Disclaimer
          </h1>

          <div className="mt-10 space-y-8 leading-relaxed text-charcoal-light">
            <p>
              {siteConfig.ministryName} Ministry offers prophetic ministry,
              prayer ministry, and teaching in a manner that is prayerful,
              biblical, and voluntary. Please read this disclaimer carefully
              before requesting or receiving ministry.
            </p>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Not a Replacement for Professional Care
              </h2>
              <p className="mt-3">
                Prophetic ministry, prayer ministry, and teaching offered by
                this ministry are not a replacement for Scripture, pastoral
                oversight, professional counselling, medical advice, legal
                advice, or financial advice. If you are facing a medical,
                psychological, legal, or financial concern, please seek
                appropriately qualified professional support.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Not an Emergency or Crisis Service
              </h2>
              <p className="mt-3">
                This ministry is not an emergency or crisis service. Anyone
                experiencing immediate danger, a medical emergency, or a
                mental-health crisis should contact local emergency services
                or an appropriate crisis-support provider right away.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Personal Responsibility
              </h2>
              <p className="mt-3">
                We encourage everyone receiving ministry to test what is
                shared, compare it with Scripture, pray through it
                personally, seek confirmation from trusted spiritual
                leaders, and take responsibility for their own decisions. We
                do not use fear, manipulation, control, pressure, or
                spiritual authority to make decisions for people.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                No Guarantee of Outcomes
              </h2>
              <p className="mt-3">
                Prophetic ministry and prayer ministry are offered in good
                faith and with care, but we cannot guarantee specific
                outcomes. Every person&apos;s journey with God is unique, and
                growth, healing, and freedom unfold in His timing.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-forest">
                Questions
              </h2>
              <p className="mt-3">
                If you have questions about this disclaimer or about what to
                expect from ministry, please contact us at{" "}
                {siteConfig.contactEmail}.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
