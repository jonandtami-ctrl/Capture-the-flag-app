import { useState } from 'react'

const PREFIX = 'camphq-record-'

// Tracks one personal-best number per game, kept in localStorage so it
// survives reloads. `higherIsBetter` controls which direction counts as an
// improvement — true for things like "time to spare" or score, false for
// things measured as a lower-is-better time.
export default function useRecords(gameId, higherIsBetter = true) {
  const key = PREFIX + gameId
  const [best, setBest] = useState(() => {
    const raw = localStorage.getItem(key)
    return raw === null ? null : Number(raw)
  })

  const submit = (value) => {
    const isNew = best === null || (higherIsBetter ? value > best : value < best)
    if (isNew) {
      setBest(value)
      localStorage.setItem(key, String(value))
    }
    return isNew
  }

  return { best, submit }
}
