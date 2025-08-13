type Params = { params: { slug: string } }

export default async function BlogPostPage({ params }: Params) {
  const { slug } = params
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Post: {slug}</h1>
      <p className="text-muted-foreground mt-2">Rendered from the zemenay-blog package.</p>
    </div>
  )
}

