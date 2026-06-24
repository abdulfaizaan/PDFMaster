'use client'
 
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-ink mb-4">Something went wrong!</h2>
      <p className="text-ink-muted-80 mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error occurred while processing your request.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="secondary">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
