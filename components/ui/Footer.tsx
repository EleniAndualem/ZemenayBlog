import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl gradient-text">Blog</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A modern blog platform built with Next.js, featuring advanced content management and beautiful design.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Home
              </Link>
              <Link
                href="/blog"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Blog
              </Link>
              <Link
                href="/categories"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Categories
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Categories</h3>
            <div className="space-y-2">
              <Link
                href="/blog?category=technology"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Technology
              </Link>
              <Link
                href="/blog?category=design"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Design
              </Link>
              <Link
                href="/blog?category=development"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Development
              </Link>
              <Link
                href="/blog?category=business"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Business
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="mailto:contact@blogplatform.com"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Contact Us"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              Get in touch with us for support or collaboration.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Hackathon Blog. All rights reserved. Built with ❤️ using Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
