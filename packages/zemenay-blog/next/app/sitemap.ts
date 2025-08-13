export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  return [
    { url: `${base}/blog`, lastModified: new Date() }
  ]
}

