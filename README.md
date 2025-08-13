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

## 🔗 Integration

### For Zemenay Community Website

This blog is designed to integrate seamlessly with the main Zemenay community website. See `INTEGRATION.md` for complete integration instructions.

**Simple Integration:**
```typescript
const BlogHeader = () => {
  const handleBlogClick = () => {
    window.location.href = 'https://zemenay-blog.vercel.app'
  }
  
  return <button onClick={handleBlogClick}>Blog</button>
}
```

> 💡 **Note:** This is the deployed blog URL. If you're running your own instance, replace it with your actual deployed blog URL.

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

- **Blog URL:** [https://zemenay-blog.vercel.app](https://zemenay-blog.vercel.app)
- **Admin Dashboard:** Available after login with admin credentials

---

Built for the Zemenay community Done by Team Dev.