# Zemenay Blog Package

A complete, self-contained blog package for Next.js applications with dedicated database support.

> 📦 **Published Package:** This package is now live on npm and ready for production use!

## Features

- **Complete Blog System**: Home page, blog listing, individual posts, categories, tags
- **Admin Dashboard**: Post management, user management, analytics, audit logs
- **Authentication**: JWT-based auth with role-based access control
- **Dedicated Database**: Uses `BLOG_DATABASE_URL` for isolated data
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **SEO Ready**: Sitemaps, robots.txt, meta tags

## Installation

```bash
npm install zemenay-blog
# or
pnpm add zemenay-blog
# or
yarn add zemenay-blog
```

> 📦 **Package Published:** This package is now live on npm at [https://www.npmjs.com/package/zemenay-blog](https://www.npmjs.com/package/zemenay-blog)

## Quick Start

### 1. Configure Next.js

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['zemenay-blog']
};
export default nextConfig;
```

### 2. Configure Tailwind

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/zemenay-blog/**/*.{ts,tsx}'
  ]
};
```

### 3. Set Environment Variables

```env
BLOG_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=your-secret-key
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### 4. Generate Prisma Client

```bash
npx prisma generate --schema node_modules/zemenay-blog/prisma/blog.schema.prisma
```

### 5. Mount Routes

Create re-export files in your app:

```ts
// app/page.tsx (home page)
export { default } from 'zemenay-blog/next/app/page';

// app/blog/page.tsx
export { default } from 'zemenay-blog/next/app/blog/page';

// app/blog/[slug]/page.tsx
export { default } from 'zemenay-blog/next/app/blog/[slug]/page';

// app/admin/page.tsx
export { default } from 'zemenay-blog/next/app/admin/page';

// app/admin/dashboard/page.tsx
export { default } from 'zemenay-blog/next/app/admin/dashboard/page';
```

## Database Schema

The package includes a complete Prisma schema with:

- Users and roles
- Posts with categories and tags
- Comments and likes
- Analytics and audit logs
- Image management

## Components

The package exports a comprehensive set of UI and blog components that you can use in your application:

### UI Components

```tsx
import { 
  Button, 
  Card, 
  Dialog, 
  Form, 
  Input, 
  Select,
  // ... and many more
} from 'zemenay-blog/components/ui';

// Or import individual components
import { Button } from 'zemenay-blog/components/ui/button';
```

### Blog Components

```tsx
import { 
  CommentSection, 
  LikeButton, 
  Pagination, 
  SearchAndFilter, 
  SocialShare 
} from 'zemenay-blog/components/blog';

// Or import individual components
import { CommentSection } from 'zemenay-blog/components/blog/CommentSection';
```

### Other Components

```tsx
import { 
  NewsletterForm, 
  RichTextEditor, 
  ThemeProvider 
} from 'zemenay-blog/components';
```

### Available UI Components

- **Layout**: Header, Footer, Sidebar, NavigationMenu
- **Forms**: Form, Input, Textarea, Select, Checkbox, RadioGroup, Switch
- **Feedback**: Toast, Alert, Progress, Skeleton, LoadingSkeleton
- **Data Display**: Table, Card, Badge, Avatar, Separator
- **Navigation**: Breadcrumb, Pagination, Tabs, Accordion
- **Overlay**: Dialog, Popover, Tooltip, HoverCard, Sheet
- **Media**: OptimizedImage, Carousel, Chart
- **Utilities**: ErrorBoundary, ThemeProvider

### Available Blog Components

- **CommentSection**: Full-featured comment system with replies
- **LikeButton**: Like/unlike functionality with animations
- **Pagination**: Blog post pagination with search
- **SearchAndFilter**: Advanced search and filtering
- **SocialShare**: Social media sharing buttons

## API Routes

The package provides these API endpoints:

- `/api/posts` - Blog post management
- `/api/categories` - Category management
- `/api/tags` - Tag management
- `/api/comments` - Comment system
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin endpoints
- `/api/newsletter/subscribe` - Newsletter subscription

## Pages

The package includes these pages:

- `/` - Homepage with featured posts and stats
- `/blog` - Blog listing page
- `/blog/[slug]` - Individual blog post
- `/categories` - Category listing
- `/profile` - User profile management
- `/auth/login` - User login
- `/auth/register` - User registration
- `/admin/*` - Admin dashboard pages

## Components

### UI Components
- `Header` - Navigation with auth
- `Footer` - Site footer
- `Button`, `Card`, etc. - shadcn/ui components

### Blog Components
- `BlogListSkeleton` - Loading states
- `ErrorBoundary` - Error handling
- `LoadingSkeleton` - Skeleton loaders
- `NewsletterForm` - Newsletter subscription form
- `RichTextEditor` - Rich text editing component
- `ThemeProvider` - Theme management provider

## Hooks

- `useAuth` - Authentication state and methods
- `useTheme` - Theme management
- `useBlogPosts` - Blog post data

## Styling

The package uses Tailwind CSS with custom CSS variables for theming. Include the package's CSS in your global styles:

```css
@import 'zemenay-blog/styles/globals.css';
```

## Scripts

The package includes utility scripts for database operations:

```bash
# Test database connection
node node_modules/zemenay-blog/scripts/test-db-connection.js

# Seed default categories
node node_modules/zemenay-blog/scripts/seed-categories.js

# Check existing posts
node node_modules/zemenay-blog/scripts/check-posts.js
```

## Utilities

### Prisma Client
Access the package's Prisma client directly:

```ts
import { PrismaClient } from 'zemenay-blog/prisma/generated/client'

const prisma = new PrismaClient()
// Use for database operations
```

### Core Pages
Mount these core pages in your app:

```ts
// app/page.tsx (homepage)
export { default } from 'zemenay-blog/next/app/page'

// app/error.tsx (error handling)
export { default } from 'zemenay-blog/next/app/error'

// app/not-found.tsx (404 page)
export { default } from 'zemenay-blog/next/app/not-found'
```

### Additional Pages
Mount these optional pages in your app:

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

### Admin Pages
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

## Customization

### Theme Colors
Override CSS variables in your global CSS:

```css
:root {
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --accent: 241 245 249;
  --accent-foreground: 15 23 42;
}
```

### Import Styles
You can also import the package styles in your layout:

```tsx
// app/layout.tsx
import 'zemenay-blog/styles/globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Layout
Customize the layout by wrapping with your own providers:

```tsx
// app/layout.tsx
import { AuthProvider } from 'zemenay-blog/hooks/useAuth';
import { ThemeProvider } from 'zemenay-blog/hooks/useTheme';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Deployment

1. Set `BLOG_DATABASE_URL` in your deployment environment
2. Run Prisma migrations if needed
3. Deploy your main app - the blog routes are compiled with it

## Database Migrations

For production deployments, run migrations:

```bash
npx prisma migrate deploy --schema node_modules/zemenay-blog/prisma/blog.schema.prisma
```

## Support

For issues or questions:
- Check the [main repository](https://github.com/EleniAndualem/zemenay-blog)
- Open an issue in the repository
- Contact the development team



## License

MIT License - see LICENSE file for details.
