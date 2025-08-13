export type BlogAuthAdapter = {
  getCurrentUserId: (req: Request) => Promise<string | null>
  requireAdmin: (req: Request) => Promise<void>
}

let adapter: BlogAuthAdapter | null = null

export function configureBlogAuth(a: BlogAuthAdapter) {
  adapter = a
}

export function getBlogAuth(): BlogAuthAdapter {
  if (!adapter) {
    return {
      async getCurrentUserId() { return null },
      async requireAdmin() { throw new Error('Admin auth not configured') },
    }
  }
  return adapter
}

