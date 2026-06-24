'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center font-sans">
          <h2 className="text-3xl font-bold mb-4">Critical Error</h2>
          <p className="text-gray-600 mb-8">A critical error has occurred. We are working to resolve the issue.</p>
          <button 
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
