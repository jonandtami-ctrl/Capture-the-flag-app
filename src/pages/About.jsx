import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="chip">About</span>
      <h1 className="section-heading mt-4">Built to get everyone off the bench faster</h1>
      <div className="mt-6 space-y-4 text-forest-200/80">
        <p>
          Basecamp Games started as a simple problem: every camp counselor, coach, or
          camp-out parent ends up doing the same three things by hand — splitting people
          into fair teams, timing rounds, and keeping score on a scrap of paper.
        </p>
        <p>
          This app bundles the rules for the most requested camp games — Capture the
          Flag, Flame Battlers, Risk Takers, and more — with the exact tools you need to
          run them: an instant team randomizer, a big glanceable countdown timer, and a
          live scoreboard. No sign-up, no installs, no fumbling with a whistle and a
          notepad.
        </p>
        <p>
          Everything runs entirely on your device — no backend, no accounts, and your
          rosters are only ever stored locally in your browser.
        </p>
      </div>
      <Link to="/games" className="btn-primary mt-8 inline-flex">
        Browse the games →
      </Link>
    </div>
  )
}
