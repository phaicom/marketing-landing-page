'use client'

import { useEffect } from 'react'

interface Props {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <p className="mt-4">Error 404</p>
      <button
        className="text-white underline underline-offset-2"
        onClick={reset}
        type="button"
      >
        Reset
      </button>
    </div>
  )
}
