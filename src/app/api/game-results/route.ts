import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_RESULTS = 50;

type ValidPayload = {
  wpm: number;
  accuracy: number;
  keystrokes: number;
  correctKeystrokes?: number;
  elapsedTime: number;
  difficulty: string;
};

type NormalizedPayload = { data: ValidPayload } | { error: string };

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

const normalizePayload = (body: unknown): NormalizedPayload => {
  if (!body || typeof body !== 'object') return { error: 'Invalid JSON payload' };

  const payload = body as Record<string, unknown>;
  const wpm = toNumber(payload.wpm ?? payload.wordsPerMinute);
  const accuracy = toNumber(payload.accuracy);
  const keystrokes = toNumber(payload.keystrokes ?? payload.totalCharacters);
  const correctKeystrokesRaw = payload.correctKeystrokes ?? payload.correctCharacters;
  const correctKeystrokes =
    correctKeystrokesRaw === undefined ? undefined : toNumber(correctKeystrokesRaw);
  const elapsedTime = toNumber(payload.elapsedTime ?? payload.totalTime);
  const difficulty = typeof payload.difficulty === 'string' ? payload.difficulty : 'normal';

  if ([wpm, accuracy, keystrokes, elapsedTime].some((v) => Number.isNaN(v))) {
    return { error: 'Missing or invalid required fields' };
  }

  if (wpm < 0 || keystrokes < 0 || elapsedTime < 0 || accuracy < 0 || accuracy > 100) {
    return { error: 'Fields out of allowed range' };
  }

  if (correctKeystrokes !== undefined) {
    if (
      Number.isNaN(correctKeystrokes) ||
      correctKeystrokes < 0 ||
      correctKeystrokes > keystrokes
    ) {
      return { error: 'Invalid correctKeystrokes' };
    }
  }

  return {
    data: {
      wpm: Math.round(wpm),
      accuracy,
      keystrokes: Math.round(keystrokes),
      correctKeystrokes:
        correctKeystrokes === undefined ? undefined : Math.round(correctKeystrokes),
      elapsedTime: Math.round(elapsedTime),
      difficulty,
    },
  };
};

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

  const json = await req.json().catch(() => null);
  const normalized = normalizePayload(json);
  if ('error' in normalized) return badRequest(normalized.error);

  const { wpm, accuracy, keystrokes, correctKeystrokes, elapsedTime, difficulty } = normalized.data;

  const created = await prisma.gameResult.create({
    data: {
      userId,
      wordsPerMinute: wpm,
      accuracy,
      totalCharacters: keystrokes,
      correctCharacters: correctKeystrokes ?? keystrokes,
      totalTime: elapsedTime,
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
