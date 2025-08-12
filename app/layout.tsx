import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/hooks/useTheme"
import { AuthProvider } from "@/hooks/useAuth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zemenay Blog - Modern Content Management",
  description: "Zemenay Blog is your go-to space for inspiring stories, practical tutorials, and valuable insights.",
  keywords: "Zemenay Blog, blog, content management, Next.js, modern design",
  generator: 'v0.dev',
  icons: {
    icon: "/zememay logo.png"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
