# Zemenay Blog Integration Documentation

## How to Integrate Zemenay Blog with Your Main Site

Hey Zemenay Community team! Here's how to add a blog button to your main website that will redirect users to the Zemenay Blog.

---

## Option 1: Simple Blog Header Button (Recommended)

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

## Option 2: If You're Using Next.js

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
