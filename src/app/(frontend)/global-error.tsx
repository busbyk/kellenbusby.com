'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-background text-foreground">
        <div className="flex justify-center items-center flex-col gap-6 flex-grow">
          <h1 className="text-4xl font-bold">Something went wrong!</h1>
          <p className="text-lg">{error.message}</p>
          {process.env.NODE_ENV !== 'production' && error.stack && (
            <>
              <p>The stack trace is:</p>
              <pre className="text-xs overflow-auto max-w-full p-4 bg-gray-100 dark:bg-gray-800 rounded">
                {error.stack}
              </pre>
            </>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
