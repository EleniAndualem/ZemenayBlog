"use client"

import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Home, Search, ArrowLeft, BookOpen } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Browse Blog Posts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Discover our latest articles and insights</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Search className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Search Content</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Find what you're looking for</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
              <Link href="/blog">
                <BookOpen className="w-4 h-4" />
                Browse Blog
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please{" "}
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
