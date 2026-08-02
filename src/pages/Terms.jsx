export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="chip">Legal</span>
      <h1 className="section-heading mt-4">Terms of Use & Disclaimer</h1>
      <p className="mt-2 text-sm text-forest-400/50">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-forest-200/80">
        <section>
          <h2 className="font-display text-xl text-white">Just a toolkit</h2>
          <p className="mt-2">
            Basecamp Games provides game rules, suggestions, and companion tools (team
            randomizer, timer, scoreboard, market simulator) for entertainment and
            organizational purposes only. We don't supervise your game, and we're not
            responsible for how it's run.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Assume the risk</h2>
          <p className="mt-2">
            The games described involve physical activity — running, tagging, throwing water
            balloons, and similar — which carry an inherent risk of minor injury. Always
            match activities to participants' age, ability, and health, supervise
            appropriately, choose a safe location, and follow any rules your camp,
            organization, or venue requires. You are solely responsible for assessing
            whether a game is appropriate for your group and for running it safely.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Prank Wars specifically</h2>
          <p className="mt-2">
            Prank Wars requires informed, enthusiastic consent from everyone being pranked
            before you start. Pranks should be harmless, quick to clean up, and avoid
            anyone's personal belongings, food/allergens, or anything that could genuinely
            scare, embarrass, or upset a participant. If in doubt, leave it out.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">No warranty</h2>
          <p className="mt-2">
            This app and its contents are provided "as is," without warranties of any kind.
            We make no guarantee the game rules or tools are error-free or suited to any
            particular purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Limitation of liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, Basecamp Games and its creators are not
            liable for any injury, loss, or damage arising from your use of this site or
            participation in any game described here.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-white">Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the site means you
            accept the current version.
          </p>
        </section>
      </div>
    </div>
  )
}
