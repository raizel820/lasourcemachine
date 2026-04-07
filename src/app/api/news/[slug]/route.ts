import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/news/[slug] - Get single news post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const newsPost = await db.newsPost.findFirst({
      where: { slug, status: 'published' },
    })

    if (!newsPost) {
      return NextResponse.json({ error: 'News post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: newsPost })
  } catch (error) {
    console.error('Error fetching news post:', error)
    return NextResponse.json({ error: 'Failed to fetch news post' }, { status: 500 })
  }
}

// PUT /api/news/[slug] - Update news post (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()

    const existing = await db.newsPost.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'News post not found' }, { status: 404 })
    }

    if (body.slug && body.slug !== slug) {
      const slugExists = await db.newsPost.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'News post with this slug already exists' }, { status: 409 })
      }
    }

    const newsPost = await db.newsPost.update({
      where: { slug },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt ?? null }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage ?? null }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.author !== undefined && { author: body.author ?? null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.publishedAt !== undefined && {
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        }),
      },
    })

    return NextResponse.json({ data: newsPost })
  } catch (error) {
    console.error('Error updating news post:', error)
    return NextResponse.json({ error: 'Failed to update news post' }, { status: 500 })
  }
}

// DELETE /api/news/[slug] - Delete news post (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const existing = await db.newsPost.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'News post not found' }, { status: 404 })
    }

    await db.newsPost.delete({ where: { slug } })

    return NextResponse.json({ message: 'News post deleted successfully' })
  } catch (error) {
    console.error('Error deleting news post:', error)
    return NextResponse.json({ error: 'Failed to delete news post' }, { status: 500 })
  }
}
