import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GameResultFlexibleSchema } from '@/lib/validation/game';

const MAX_RESULTS = 50;

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

const mapResult = (result: {
  id: string;
  createdAt: Date;
  wordsPerMinute: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  totalTime: number;
  difficulty: string;
}) => ({
  id: result.id,
  createdAt: result.createdAt,
  wpm: result.wordsPerMinute,
  accuracy: result.accuracy,
  keystrokes: result.totalCharacters,
  correctKeystrokes: result.correctCharacters,
  elapsedTime: result.totalTime,
  difficulty: result.difficulty,
});

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions);
  const userId =
    session?.user && 'id' in session.user ? (session.user as { id?: string }).id : undefined;
  if (!userId) return unauthorized();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return badRequest('Invalid JSON payload');
  }

  const result = GameResultFlexibleSchema.safeParse(json);
  if (!result.success) {
    return badRequest(result.error.issues[0]?.message || 'Validation failed');
  }

  const { wpm, accuracy, keystrokes, correctKeystrokes, elapsedTime, difficulty } = result.data;

  const created = await prisma.gameResult.create({
    data: {
      userId,
      wordsPerMinute: Math.round(wpm),
      accuracy,
      totalCharacters: Math.round(keystrokes),
      correctCharacters: Math.round(correctKeystrokes ?? keystrokes),
      totalTime: Math.round(elapsedTime),
      difficulty,
    },
    select: {
      id: true,
      createdAt: true,
      wordsPerMinute: true,
      accuracy: true,
      totalCharacters: true,
      correctCharacters: true,
      totalTime: true,
      difficulty: true,
    },
  });

  return NextResponse.json(mapResult(created), { status: 201 });
};

export const GET = async () => {
  const session = await getServerSession(authOptions);
  const userId =
    session?.user && 'id' in session.user ? (session.user as { id?: string }).id : undefined;
  if (!userId) return unauthorized();

  const results = await prisma.gameResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: MAX_RESULTS,
    select: {
      id: true,
      createdAt: true,
      wordsPerMinute: true,
      accuracy: true,
      totalCharacters: true,
      correctCharacters: true,
      totalTime: true,
      difficulty: true,
    },
  });

  return NextResponse.json({ results: results.map(mapResult) }, { status: 200 });
};
