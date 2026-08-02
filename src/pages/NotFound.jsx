import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center sm:px-6">
      <span className="text-6xl">🧭</span>
      <h1 className="section-heading mt-4">Lost in the woods?</h1>
      <p className="mt-3 text-forest-300/70">This page wandered off the trail. Let's get you back to camp.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  )
}
