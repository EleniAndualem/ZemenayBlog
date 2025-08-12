import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp, Users, BookOpen, Star } from "lucide-react"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to the Future of <span className="gradient-text">Blogging</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers. Join thousands of readers
              exploring content that matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white btn-gradient rounded-lg transition-all hover:shadow-lg group"
              >
                Explore Blog
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-3 text-lg font-medium border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Articles Published</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">10K+</h3>
              <p className="text-muted-foreground">Active Readers</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">1M+</h3>
              <p className="text-muted-foreground">Monthly Views</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">4.9</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Articles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular and trending articles from the community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Post 1 */}
            <article className="card-gradient rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/modern-web-development.png"
                  alt="Featured post"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">Technology</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  The Future of Web Development
                </h3>
                <p className="text-muted-foreground mb-4">
                  Exploring the latest trends and technologies shaping the future of web development...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full gradient-bg"></div>
                    <span className="text-sm font-medium">John Doe</span>
                  </div>
                  <span className="text-sm text-muted-foreground">5 min read</span>
                </div>
              </div>
            </article>

            {/* Featured Post 2 */}
            <article className="card-gradient rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/ui-ux-design-trends.png"
                  alt="Featured post"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">Design</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  UI/UX Design Trends 2024
                </h3>
                <p className="text-muted-foreground mb-4">
                  Discover the latest design trends that are shaping user experiences in 2024...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full gradient-bg"></div>
                    <span className="text-sm font-medium">Jane Smith</span>
                  </div>
                  <span className="text-sm text-muted-foreground">7 min read</span>
                </div>
              </div>
            </article>

            {/* Featured Post 3 */}
            <article className="card-gradient rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/startup-business-growth.png"
                  alt="Featured post"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-full">Business</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  Building a Successful Startup
                </h3>
                <p className="text-muted-foreground mb-4">
                  Essential strategies and insights for building and scaling a successful startup...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full gradient-bg"></div>
                    <span className="text-sm font-medium">Mike Johnson</span>
                  </div>
                  <span className="text-sm text-muted-foreground">10 min read</span>
                </div>
              </div>
            </article>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 font-medium text-blue-600 hover:text-blue-700 transition-colors group"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Get the latest articles and insights delivered directly to your inbox
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-3 text-lg font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up for Updates
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
