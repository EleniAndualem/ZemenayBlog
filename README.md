# Zemenay Blog - with Modern Content Management System

A full-featured blog platform built with Next.js, featuring a modern admin dashboard, role-based authentication, and seamless integration capabilities for the Zemenay community.

> 🚀 **Ready for Integration:** The `zemenay-blog` package is now published to npm and ready to be integrated into the main Zemenay Tech website. See [Integration Guide](#-integration-for-the-main-site) below.

> 📦 **Latest Version:** `zemenay-blog@0.1.1` - Now includes complete UI and blog component library with 55+ components!

## 🚀 Features

### **Core Features**
- 📝 Rich blog content management
- 🛡️ Role-based access control (User, Admin, Superadmin)
- 📱 Fully responsive design
- 🌙 Dark/Light mode toggle
- 🔍 Search and filtering
- 💬 Interactive comment system
- ❤️ Like/unlike functionality
- 📊 Analytics dashboard

### **Admin Dashboard**
- 📝 Post management (create, edit, publish, archive)
- 💬 Comment moderation
- 📈 Analytics and insights
- 👥 User management
- 📋 Audit logging

### **Integration Ready**
- 🌐 CORS-enabled APIs for external consumption
- 🔗 Simple redirect integration for main Zemenay website
- 📡 Public API endpoints
- 🚀 Vercel deployment ready

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** JWT + bcrypt
- **Deployment:** Vercel

## 📁 Project Structure

```
.
├── app/                                  # Local dev host (for running the blog package locally)
│   ├── blog/                             # Can re-export package pages during local dev
│   └── admin/                            # Optional admin re-exports during local dev
├── packages/
│   └── zemenay-blog/                     # The installable blog package (published/consumed by main site)
│       ├── package.json
│       ├── [README.md](./packages/zemenay-blog/README.md)
│       ├── .npmignore
│       ├── prisma/
│       │   ├── blog.schema.prisma        # Dedicated blog schema (uses BLOG_DATABASE_URL)
│       │   └── generated/client/         # Prisma client (generated)
│       ├── next/
│       │   ├── app/
│       │   │   ├── blog/                 # Public blog pages
│       │   │   ├── admin/                # Admin dashboard pages
│       │   │   ├── api/                  # Package API re-exports (select endpoints)
│       │   │   ├── robots.ts
│       │   │   └── sitemap.ts
│       │   └── lib/prisma.ts             # Package Prisma client shim (reads BLOG_DATABASE_URL)
│       ├── components/                   # Package components (e.g., Header)
│       ├── hooks/                        # Package hooks (e.g., useAuth)
│       ├── lib/                          # Package utilities
│       ├── ui/                           # UI entrypoints
│       ├── auth/                         # Auth entrypoints
│       └── examples/host-app-stubs/      # Ready-to-copy re-export files for host app
├── scripts/                              # Minimal utilities
│   ├── test-db-connection.js             # Verify DB connection
│   ├── seed-categories.js                # Seed core categories
│   └── check-posts.js                    # List posts quickly
├── [INTEGRATION.md](./INTEGRATION.md)    # Main-site integration guide
├── next.config.mjs
├── tailwind.config.js
├── package.json                          # Workspaces enabled (packages/*)
└── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EleniAndualem/ZemenayBlog.git
   cd ZemenayBlog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   ```

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## 🔗 Integration (for the main site)

For developers of the main site [Zemenay Tech](https://www.zemenaytech.com/), here’s the fastest way to install and mount the blog under your app.

### Option A (recommended): Install via npm and mount under /blog

1) Install the published package
```bash
npm install zemenay-blog
# or
pnpm add zemenay-blog
# or
yarn add zemenay-blog
```

> 📦 **Package Published:** The `zemenay-blog` package is now live on npm at [https://www.npmjs.com/package/zemenay-blog](https://www.npmjs.com/package/zemenay-blog)

2) Next.js config (transpile the package)
```js
// next.config.mjs
/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ['zemenay-blog'],
}
```

3) Tailwind config (scan package files)
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/zemenay-blog/**/*.{ts,tsx}',
  ],
}
```

4) Environment variables
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

5) Mount the blog and admin routes (re-export files in your host app)
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

Admin (optional):
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

### 5b) Wire additional package pages (optional)
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

### 5c) Mount all available API routes (optional)
> 📋 **Complete API Routes Reference:** For a comprehensive list of all available API routes, see the [INTEGRATION.md](./INTEGRATION.md) file.

### 5d) Use package styles and scripts (optional)
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

### 5e) Access package utilities
```ts
// Import Prisma client from package
import { PrismaClient } from 'zemenay-blog/prisma/generated/client'

// Use in your API routes or server components
const prisma = new PrismaClient()
```

6) Generate Prisma clients (host + blog)
```bash
npm run db:generate
```

7) Run locally
```bash
npm run dev
```

Notes
- `DATABASE_URL` = main site DB. `BLOG_DATABASE_URL` = blog package DB.
- If styles don’t appear, ensure Tailwind `content` includes `node_modules/zemenay-blog`.
- More details and alternatives are in [INTEGRATION.md](./INTEGRATION.md).

> 📋 **Complete Mount Points Reference:** For a comprehensive list of all available mount points, see the [INTEGRATION.md](./INTEGRATION.md) file.

## 🔌 API Endpoints

### Public APIs (CORS Enabled)
- `GET /api/posts` - Get published posts
- `GET /api/categories` - Get categories  
- `GET /api/posts/[slug]` - Get single post

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/[id]` - Update post

> 💡 **Note:** This is a subset of available APIs. For complete API documentation, check the source code or contact the development team.

## 🚀 Deployment

### Current Status
✅ **Deployed and Live** - This blog is currently deployed on Vercel and accessible to the Zemenay community.

### Package Status
✅ **Published to npm** - The `zemenay-blog` package is now live on npm and ready for integration:
- **Package URL:** [https://www.npmjs.com/package/zemenay-blog](https://www.npmjs.com/package/zemenay-blog)
- **Version:** `0.1.1`
- **Install Command:** `npm install zemenay-blog`

### For Local Development
If you want to run this locally or deploy your own instance:

1. **Clone and setup** (see Quick Start above)
2. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Set environment variables
   - Deploy automatically

### Environment Variables
```env
DATABASE_URL="your-production-db-url"
JWT_SECRET="your-production-secret"
```

## 👥 Demo Accounts

After seeding:
- **Superadmin:** `superadmin@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`
- **User:** `user@example.com` / `password123`

## 📋 Changelog

### Version 0.1.1 (Latest)
- ✅ **Complete UI Component Library** - Added 55+ UI components (Button, Card, Dialog, Form, etc.)
- ✅ **Blog Component Library** - Added 5 blog-specific components (CommentSection, LikeButton, Pagination, etc.)
- ✅ **Enhanced Package Exports** - Proper index files for easy component imports
- ✅ **Updated Dependencies** - Added all necessary Radix UI and utility dependencies
- ✅ **Comprehensive Documentation** - Complete mount points reference and integration guides
- ✅ **Ready for Production** - Full component library ready for npm consumption

### Version 0.1.0
- ✅ **Initial Release** - Core blog functionality with admin dashboard
- ✅ **Basic Components** - Essential UI components and blog features
- ✅ **Database Schema** - Complete Prisma schema with all necessary models
- ✅ **API Routes** - Full CRUD operations for posts, comments, and users

## 📚 Documentation

- **[INTEGRATION.md](./INTEGRATION.md)** - Complete integration guide for main site developers
- **[Package README](./packages/zemenay-blog/README.md)** - Detailed package documentation



## 🤝 Support

For integration help, refer to [INTEGRATION.md](./INTEGRATION.md) or contact the development team.

## 🌐 Live Demo

- **Blog URL:** [https://zemenay-blog.vercel.app/](https://zemenay-blog.vercel.app/)
- **Admin Dashboard:** Available after login with admin credentials

---

Built for the Zemenay community Done by Team Dev.
