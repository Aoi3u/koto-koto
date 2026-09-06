import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const MARK_READ_RATE_LIMIT = {
  maxRequests: 60,
  windowMs: 10 * 60 * 1000,
  message: 'Too many requests, please try again later.',
} as const;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limited = rateLimit(`announcement-read:${session.user.id}`, MARK_READ_RATE_LIMIT);
    if (limited) return limited;

    const { id: announcementId } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true },
    });
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await prisma.announcementRead.upsert({
      where: {
        userId_announcementId: { userId: session.user.id, announcementId },
      },
      update: {},
      create: { userId: session.user.id, announcementId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to mark announcement as read:', error);
    return NextResponse.json({ error: 'Failed to mark announcement as read' }, { status: 500 });
  }
}
