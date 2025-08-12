# Hackathon Blog - Modern Content Management System

A full-featured blog platform built with Next.js, featuring a modern admin dashboard, role-based authentication, and a beautiful dark blue theme with gradients.

## 🚀 Features

### **Frontend Features**
- 🎨 Modern dark blue theme with beautiful gradients
- 📱 Fully responsive design (mobile-first approach)
- 🌙 Dark/Light mode toggle with user preferences
- ⚡ Optimized performance with Next.js App Router
- 🖼️ Image optimization and lazy loading
- 🔍 Search and filtering capabilities
- 💬 Interactive comment system
- ❤️ Like/unlike functionality
- 📊 Real-time analytics display

### **Admin Dashboard**
- 🛡️ Role-based access control (User, Admin, Superadmin)
- 📝 Rich post management (create, edit, publish, archive)
- 💬 Comment moderation
- 📈 Detailed analytics and insights
- 👥 User management (Superadmin only)
- 🔍 Advanced search and filtering
- 📋 Audit logging for admin actions
- 🎯 Intuitive and modern interface

### **Authentication & Security**
- 🔐 JWT-based authentication
- 🔒 Secure password hashing with bcrypt
- 👤 Role-based permissions
- 🛡️ Protected API routes
- 📝 Admin audit logging

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Authentication:** JWT + bcrypt
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📁 Project Structure

\`\`\`
hackathon-blog/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── blog/              # Public blog pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd hackathon-blog
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   \`\`\`env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
   
   # Optional: For production
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="another-secret-for-nextauth"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 👥 Demo Accounts

After seeding the database, you can use these demo accounts:

- **Superadmin:** `superadmin@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`
- **User:** `user@example.com` / `password123`

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts with role-based permissions
- **Posts** - Blog posts with rich content and metadata
- **Categories** - Post categorization system
- **Tags** - Flexible tagging system
- **Comments** - Nested comment system
- **Likes** - User engagement tracking
- **Analytics** - Detailed post performance metrics
- **Audit Log** - Admin action tracking

## 🎨 Design System

### Color Palette
- **Primary:** Dark blue to indigo gradients
- **Secondary:** Complementary accent colors
- **Background:** Adaptive light/dark themes
- **Text:** High contrast for accessibility

### Components
- Modern card designs with subtle shadows
- Gradient buttons and interactive elements
- Responsive navigation and layouts
- Smooth animations and transitions

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   \`\`\`

2. **Set Environment Variables**
   
   In your Vercel dashboard, add the same environment variables from your `.env` file.

3. **Database Setup**
   
   Ensure your production database is set up and the `DATABASE_URL` points to it.

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/posts` - Get posts (role-based)
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

### Public Endpoints
- `GET /api/posts` - Get published posts
- `GET /api/posts/[slug]` - Get single post
- `POST /api/posts/[id]/like` - Like/unlike post
- `POST /api/posts/[id]/comments` - Add comment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Tailwind CSS for the utility-first CSS framework
- Prisma for the excellent ORM
- Lucide for the beautiful icons

---

Built with ❤️ using Next.js and modern web technologies.
