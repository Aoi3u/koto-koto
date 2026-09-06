import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const CREATE_ANNOUNCEMENT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 10 * 60 * 1000,
  message: 'Too many requests, please try again later.',
} as const;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const;
  }

  return { session } as const;
}

export async function GET() {
  const check = await requireAdmin();
  if ('error' in check) return check.error;

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, body: true, createdAt: true },
    });

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if ('error' in check) return check.error;

  const limited = rateLimit(
    `admin-create-announcement:${check.session.user.id}`,
    CREATE_ANNOUNCEMENT_RATE_LIMIT
  );
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, body: messageBody } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
    }
    if (title.trim().length > 100) {
      return NextResponse.json({ error: 'Title too long (max 100 characters)' }, { status: 400 });
    }
    if (!messageBody || typeof messageBody !== 'string' || messageBody.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    if (messageBody.trim().length > 4000) {
      return NextResponse.json({ error: 'Body too long (max 4000 characters)' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: { title: title.trim(), body: messageBody.trim() },
      select: { id: true, title: true, body: true, createdAt: true },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
