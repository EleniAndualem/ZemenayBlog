"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Error Details (Development Mode)
              </h3>
              <pre className="text-sm text-red-700 dark:text-red-300 overflow-auto">{error.message}</pre>
              {error.digest && <p className="text-xs text-red-600 dark:text-red-400 mt-2">Error ID: {error.digest}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Try Again</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sometimes a simple refresh fixes the issue</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Home className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Go Home</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Return to the homepage and start fresh</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
              <a href="/">
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Error persisting?{" "}
              <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
