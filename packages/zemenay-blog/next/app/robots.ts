export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${base}/blog/sitemap.xml`
  }
}

