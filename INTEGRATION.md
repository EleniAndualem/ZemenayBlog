# Zemenay Blog Integration Documentation

## How to Integrate Zemenay Blog with Your Main Site

Hey Zemenay Community team! Here's how to add a blog button to your main website that will redirect users to the Zemenay Blog.

---

## Option 1: Install via npm and mount under /blog (Dedicated DB)

This is the recommended setup for the main site [Zemenay Tech](https://www.zemenaytech.com/): install the package, mount the routes, and use a dedicated DB for the blog.

### 1) Install
```bash
npm i zemenay-blog
```

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
// app/blog/page.tsx
export { default } from 'zemenay-blog/next/app/blog/page'

// app/blog/[slug]/page.tsx
export { default } from 'zemenay-blog/next/app/blog/[slug]/page'

// app/blog/loading.tsx
export { default } from 'zemenay-blog/next/app/blog/loading'
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

