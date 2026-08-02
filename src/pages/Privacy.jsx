export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="chip">Legal</span>
      <h1 className="section-heading mt-4">Privacy Policy</h1>
      <p className="mt-2 text-sm text-forest-400/50">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-forest-200/80">
        <section>
          <h2 className="font-display text-xl text-white">What we collect</h2>
          <p className="mt-2">
            CampHQ doesn't require an account and doesn't run its own backend or
            database. Any information you enter — player names, team rosters, scores — is
            stored only in your browser's local storage, on your own device. We never see it,
            and it never leaves your device unless you clear it or your browser does.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Advertising & cookies</h2>
          <p className="mt-2">
            This site may display ads served by third-party advertising networks (such as
            Google AdSense). These networks may use cookies or similar technologies to serve
            ads based on your prior visits to this or other websites. You can opt out of
            personalized advertising by visiting your ad network's settings (for Google, that's{' '}
            <span className="text-forest-100">adssettings.google.com</span>).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Analytics</h2>
          <p className="mt-2">
            We may use basic, privacy-respecting analytics to understand overall traffic
            (e.g. which pages are visited), without tying that data to your identity.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Children's privacy</h2>
          <p className="mt-2">
            CampHQ is intended for use by camp staff, counselors, and organizers. We
            do not knowingly collect personal information from children, and since the app
            stores data only locally on the device in use, no player data is transmitted to
            us in the first place.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy occasionally. Continued use of the site after changes
            means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Contact</h2>
          <p className="mt-2">
            Questions about this policy? Reach out through the contact details listed on our
            About page.
          </p>
        </section>
      </div>
    </div>
  )
}
