# Zemenay Blog Integration Documentation

## How to Integrate Zemenay Blog with Your Main Site

Hey Zemenay Community team! Here's how to integrate the Zemenay Blog to your main website.

> 📦 **Package Status:** The `zemenay-blog` package is now published to npm and ready for integration!

---

## Option 1: Install via npm and mount under /blog (Dedicated DB)

This is the recommended setup for the main site [Zemenay Tech](https://www.zemenaytech.com/): install the package, mount the routes, and use a dedicated DB for the blog.

**What's included in the package:**
- ✅ Complete blog system (pages, components, API routes)
- ✅ Admin dashboard with full CRUD operations
- ✅ Authentication system with role-based access
- ✅ Database schema and Prisma client
- ✅ Styling and UI components
- ✅ Utility scripts for database operations
- ✅ Public assets and images

### 1) Install
```bash
npm install zemenay-blog
# or
pnpm add zemenay-blog
# or
yarn add zemenay-blog
```

> 📦 **Package Published:** The `zemenay-blog` package is now live on npm at [https://www.npmjs.com/package/zemenay-blog](https://www.npmjs.com/package/zemenay-blog)

### 2) Next.js config
```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['zemenay-blog']
}
export default nextConfig
```

### 3) Tailwind config
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/zemenay-blog/**/*.{ts,tsx}'
  ]
}
```

### 4) Environment variables
```env
# Blog package database (dedicated)
BLOG_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB

# Main site DB (if used)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB

# Public origin for links/SEO
NEXT_PUBLIC_SITE_URL=https://www.zemenaytech.com

# JWT secret for blog auth flows
JWT_SECRET=your_strong_secret
```

### 5) Mount routes (create re-export files)
```ts
// app/page.tsx (homepage)
export { default } from 'zemenay-blog/next/app/page'

// app/blog/page.tsx
export { default } from 'zemenay-blog/next/app/blog/page'

// app/blog/[slug]/page.tsx
export { default } from 'zemenay-blog/next/app/blog/[slug]/page'

// app/blog/loading.tsx
export { default } from 'zemenay-blog/next/app/blog/loading'

// app/error.tsx (error handling)
export { default } from 'zemenay-blog/next/app/error'

// app/not-found.tsx (404 page)
export { default } from 'zemenay-blog/next/app/not-found'
```

### 5d) Wire additional package pages (optional)
```ts
// app/categories/page.tsx
export { default } from 'zemenay-blog/next/app/categories/page'

// app/profile/page.tsx
export { default } from 'zemenay-blog/next/app/profile/page'

// app/auth/login/page.tsx
export { default } from 'zemenay-blog/next/app/auth/login/page'

// app/auth/register/page.tsx
export { default } from 'zemenay-blog/next/app/auth/register/page'

// app/api/newsletter/subscribe/route.ts
export { POST } from 'zemenay-blog/next/app/api/newsletter/subscribe/route'
```

### 5e) Use package styles and scripts (optional)
```ts
// Import package styles in your global CSS
@import 'zemenay-blog/styles/globals.css';

// Or import in your layout.tsx
import 'zemenay-blog/styles/globals.css'
```

```bash
# Run package scripts for database operations
node node_modules/zemenay-blog/scripts/test-db-connection.js
node node_modules/zemenay-blog/scripts/seed-categories.js
node node_modules/zemenay-blog/scripts/check-posts.js
```

### 5f) Access package utilities
```ts
// Import Prisma client from package
import { PrismaClient } from 'zemenay-blog/prisma/generated/client'

// Use in your API routes or server components
const prisma = new PrismaClient()
```

Admin (optional):
```ts
export { default } from 'zemenay-blog/next/app/admin/layout'                // app/admin/layout.tsx
export { default } from 'zemenay-blog/next/app/admin/page'                  // app/admin/page.tsx
export { default } from 'zemenay-blog/next/app/admin/dashboard/page'        // app/admin/dashboard/page.tsx
export { default } from 'zemenay-blog/next/app/admin/admins/page'           // app/admin/admins/page.tsx
export { default } from 'zemenay-blog/next/app/admin/admins/loading'        // app/admin/admins/loading.tsx
export { default } from 'zemenay-blog/next/app/admin/comments/page'         // app/admin/comments/page.tsx
export { default } from 'zemenay-blog/next/app/admin/analytics/page'        // app/admin/analytics/page.tsx
export { default } from 'zemenay-blog/next/app/admin/audit-log/page'        // app/admin/audit-log/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/page'            // app/admin/posts/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/loading'         // app/admin/posts/loading.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/new/page'        // app/admin/posts/new/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/[id]/edit/page'  // app/admin/posts/[id]/edit/page.tsx
export { default } from 'zemenay-blog/next/app/admin/users/page'            // app/admin/users/page.tsx
export { default } from 'zemenay-blog/next/app/admin/users/loading'         // app/admin/users/loading.tsx
```

### 5b) Mount all available API routes (optional)
```ts
// Core API routes
export { GET, POST } from 'zemenay-blog/next/app/api/posts/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/posts/[slug]/route'
export { GET, POST } from 'zemenay-blog/next/app/api/posts/[slug]/comments/route'
export { POST } from 'zemenay-blog/next/app/api/posts/[slug]/like/route'
export { GET } from 'zemenay-blog/next/app/api/posts/[slug]/like-status/route'
export { POST } from 'zemenay-blog/next/app/api/posts/[slug]/view/route'

// Categories and tags
export { GET } from 'zemenay-blog/next/app/api/categories/route'
export { GET } from 'zemenay-blog/next/app/api/tags/route'

// Comments
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/comments/[id]/route'

// Authentication
export { POST } from 'zemenay-blog/next/app/api/auth/login/route'
export { POST } from 'zemenay-blog/next/app/api/auth/logout/route'
export { GET } from 'zemenay-blog/next/app/api/auth/me/route'
export { POST } from 'zemenay-blog/next/app/api/auth/register/route'
export { PUT } from 'zemenay-blog/next/app/api/auth/update-profile/route'
export { POST } from 'zemenay-blog/next/app/api/auth/update-theme/route'

// Newsletter
export { POST } from 'zemenay-blog/next/app/api/newsletter/subscribe/route'

// Admin routes (require authentication)
export { GET } from 'zemenay-blog/next/app/api/admin/dashboard/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/posts/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/posts/[id]/route'
export { POST } from 'zemenay-blog/next/app/api/admin/posts/auto-save/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/users/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/users/[id]/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/admins/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/admins/[id]/route'
export { POST } from 'zemenay-blog/next/app/api/admin/create-admin/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/comments/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/comments/[id]/route'
export { GET } from 'zemenay-blog/next/app/api/admin/analytics/route'
export { GET } from 'zemenay-blog/next/app/api/admin/audit-log/route'

// Roles
export { GET } from 'zemenay-blog/next/app/api/roles/route'
```

### 5c) Mount SEO files (optional)
```ts
// app/robots.ts
export { default } from 'zemenay-blog/next/app/robots'

// app/sitemap.ts
export { default } from 'zemenay-blog/next/app/sitemap'
```

### 6) Generate Prisma clients
```bash
npm run db:generate
```

### 7) Run locally
```bash
npm run dev
```

### 8) Deploy
- Deploy the main site. The blog pages are compiled as part of the build.
- Set `BLOG_DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL` in the deployment settings.

### Validate
- Visit `/blog`, `/blog/<slug>`, and (optionally) `/admin`.
- Confirm posts are served from the blog DB.

## 📋 Complete Mount Points Reference

### Core Pages (Required)
```ts
// app/page.tsx (homepage)
export { default } from 'zemenay-blog/next/app/page'

// app/blog/page.tsx
export { default } from 'zemenay-blog/next/app/blog/page'

// app/blog/[slug]/page.tsx
export { default } from 'zemenay-blog/next/app/blog/[slug]/page'

// app/blog/loading.tsx
export { default } from 'zemenay-blog/next/app/blog/loading'

// app/error.tsx (error handling)
export { default } from 'zemenay-blog/next/app/error'

// app/not-found.tsx (404 page)
export { default } from 'zemenay-blog/next/app/not-found'
```

### Admin Pages (Optional)
```ts
// app/admin/layout.tsx
export { default } from 'zemenay-blog/next/app/admin/layout'

// app/admin/page.tsx
export { default } from 'zemenay-blog/next/app/admin/page'

// app/admin/dashboard/page.tsx
export { default } from 'zemenay-blog/next/app/admin/dashboard/page'

// app/admin/admins/page.tsx
export { default } from 'zemenay-blog/next/app/admin/admins/page'

// app/admin/admins/loading.tsx
export { default } from 'zemenay-blog/next/app/admin/admins/loading'

// app/admin/comments/page.tsx
export { default } from 'zemenay-blog/next/app/admin/comments/page'

// app/admin/analytics/page.tsx
export { default } from 'zemenay-blog/next/app/admin/analytics/page'

// app/admin/audit-log/page.tsx
export { default } from 'zemenay-blog/next/app/admin/audit-log/page'

// app/admin/posts/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/page'

// app/admin/posts/loading.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/loading'

// app/admin/posts/new/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/new/page'

// app/admin/posts/[id]/edit/page.tsx
export { default } from 'zemenay-blog/next/app/admin/posts/[id]/edit/page'

// app/admin/users/page.tsx
export { default } from 'zemenay-blog/next/app/admin/users/page'

// app/admin/users/loading.tsx
export { default } from 'zemenay-blog/next/app/admin/users/loading'
```

### Additional Pages (Optional)
```ts
// app/categories/page.tsx
export { default } from 'zemenay-blog/next/app/categories/page'

// app/profile/page.tsx
export { default } from 'zemenay-blog/next/app/profile/page'

// app/auth/login/page.tsx
export { default } from 'zemenay-blog/next/app/auth/login/page'

// app/auth/register/page.tsx
export { default } from 'zemenay-blog/next/app/auth/register/page'
```

### API Routes (Optional)
```ts
// Core API routes
export { GET, POST } from 'zemenay-blog/next/app/api/posts/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/posts/[slug]/route'
export { GET, POST } from 'zemenay-blog/next/app/api/posts/[slug]/comments/route'
export { POST } from 'zemenay-blog/next/app/api/posts/[slug]/like/route'
export { GET } from 'zemenay-blog/next/app/api/posts/[slug]/like-status/route'
export { POST } from 'zemenay-blog/next/app/api/posts/[slug]/view/route'

// Categories and tags
export { GET } from 'zemenay-blog/next/app/api/categories/route'
export { GET } from 'zemenay-blog/next/app/api/tags/route'

// Comments
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/comments/[id]/route'

// Authentication
export { POST } from 'zemenay-blog/next/app/api/auth/login/route'
export { POST } from 'zemenay-blog/next/app/api/auth/logout/route'
export { GET } from 'zemenay-blog/next/app/api/auth/me/route'
export { POST } from 'zemenay-blog/next/app/api/auth/register/route'
export { PUT } from 'zemenay-blog/next/app/api/auth/update-profile/route'
export { POST } from 'zemenay-blog/next/app/api/auth/update-theme/route'

// Newsletter
export { POST } from 'zemenay-blog/next/app/api/newsletter/subscribe/route'

// Admin routes (require authentication)
export { GET } from 'zemenay-blog/next/app/api/admin/dashboard/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/posts/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/posts/[id]/route'
export { POST } from 'zemenay-blog/next/app/api/admin/posts/auto-save/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/users/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/users/[id]/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/admins/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/admins/[id]/route'
export { POST } from 'zemenay-blog/next/app/api/admin/create-admin/route'
export { GET, POST, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/comments/route'
export { GET, PUT, DELETE } from 'zemenay-blog/next/app/api/admin/comments/[id]/route'
export { GET } from 'zemenay-blog/next/app/api/admin/analytics/route'
export { GET } from 'zemenay-blog/next/app/api/admin/audit-log/route'

// Roles
export { GET } from 'zemenay-blog/next/app/api/roles/route'
```

### SEO Files (Optional)
```ts
// app/robots.ts
export { default } from 'zemenay-blog/next/app/robots'

// app/sitemap.ts
export { default } from 'zemenay-blog/next/app/sitemap'
```

## Option 2: Simple Blog Header Button

### What You Need to Do

Copy this component and add it to your main navigation:

```typescript
const BlogHeader = () => {
  const handleBlogClick = () => {
    // Redirects to the blog in the same tab
    window.location.href = 'https://zemenay-blog.vercel.app/'
  }

  return (
    <button 
      onClick={handleBlogClick}
      className="blog-header-button"
    >
      Blog
    </button>
  )
}
```

### How to Use It

Add the `BlogHeader` component to your main header:

```typescript
const Header = () => {
  return (
    <header className="main-header">
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/community">Community</a>
        <BlogHeader /> {/* Add this line */}
        <a href="/contact">Contact</a>
      </nav>
    </header>
  )
}
```

---

## Option 3: If You're Using Next.js

### What You Need to Do

If your main site uses Next.js, use this version instead:

```typescript
import { useRouter } from 'next/navigation'

const BlogHeader = () => {
  const router = useRouter()

  const handleBlogClick = () => {
    // Redirects to the blog in the same tab using Next.js
    router.push('https://zemenay-blog.vercel.app/')
  }

  return (
    <button 
      onClick={handleBlogClick}
      className="blog-header-button"
    >
      Blog
    </button>
  )
}
```

### How to Use It

Same as Option 1 - just add it to your navigation.

---

## What You Need to Change

1. **Replace the URL**: Change `'https://zemenay-blog.vercel.app/'` to the actual blog URL once it's deployed
2. **Style the button**: Add your own CSS classes to match your site's design

## Example Styling

```css
.blog-header-button {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.blog-header-button:hover {
  background: #2563eb;
}
```

---

## That's It!

Once you add this button:
- Users click "Blog" on your main site
- They get redirected to the Zemenay Blog in the same tab
- They can read blog posts and interact with the blog
- When they're done, they can use the browser back button to return to your main site



## Questions?

If you need help integrating this or have questions, just let us know! The Team Dev is here to help.

---

