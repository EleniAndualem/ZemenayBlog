# Zemenay Blog - with Modern Content Management System

A full-featured blog platform built with Next.js, featuring a modern admin dashboard, role-based authentication, and seamless integration capabilities for the Zemenay community.

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
zemenay-blog/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (CORS enabled)
│   ├── auth/              # Authentication
│   ├── blog/              # Public blog
│   └── profile/           # User profiles
├── components/            # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
├── prisma/               # Database schema
└── INTEGRATION.md        # Integration guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zemenay-blog
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

1) Install the package
```bash
npm i zemenay-blog
```

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
BLOG_DATABASE_URL=postgresql://neondb_owner:npg_hq6TEblL4Avy@ep-lucky-feather-a2wnz2qf-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Main site database (if your app also uses Prisma)
DATABASE_URL=postgresql://neondb_owner:npg_owJk2lbuYAd1@ep-autumn-night-a2f5aa1a-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Used by links and SEO
NEXT_PUBLIC_SITE_URL=https://www.zemenaytech.com

# For JWT in blog auth flows
JWT_SECRET=your_strong_secret
```

5) Mount the blog and admin routes (re-export files in your host app)
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
- More details and alternatives are in `INTEGRATION.md`.

## �� API Endpoints

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

## 🤝 Support

For integration help, refer to `INTEGRATION.md` or contact the development team.

## 🌐 Live Demo

- **Blog URL:** [https://zemenay-blog.vercel.app/](https://zemenay-blog.vercel.app/)
- **Admin Dashboard:** Available after login with admin credentials

---

Built for the Zemenay community Done by Team Dev.
