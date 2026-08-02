import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="chip">About</span>
      <h1 className="section-heading mt-4">Camp games you can actually play right now</h1>
      <div className="mt-6 space-y-4 text-forest-200/80">
        <p>
          CampHQ takes the most requested camp games — Capture the Flag, Flame
          Battlers, Risk Takers, and more — and turns each one into a real playable
          browser game. Move a character, dodge an AI opponent, land the trick shot. No
          waiting around for enough people to show up.
        </p>
        <p>
          Every game is single-player versus computer-controlled opponents, built to
          finish in well under a minute so you can jump in for a quick round or chase a
          high score for a while.
        </p>
        <p>
          Planning the real, physical version for an actual camp or backyard? Every game
          page also includes companion tools — a team randomizer, timer, and
          scoreboard — for running it in person.
        </p>
        <p>
          Everything runs entirely in your browser — no backend, no accounts, no data
          leaves your device.
        </p>
      </div>
      <Link to="/games" className="btn-primary mt-8 inline-flex">
        Browse the games →
      </Link>
    </div>
  )
}
