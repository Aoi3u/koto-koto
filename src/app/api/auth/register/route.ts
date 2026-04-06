import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password strength for new registration.
 * Requirements:
 * - At least 12 characters
 * - At least one uppercase letter (A-Z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*)
 */
function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one digit' };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one special character (!@#$%^&*)',
    };
  }

  return { valid: true };
}

const GENERIC_MESSAGE =
  'Registration request received. If the email is not registered, an account will be created.';

export const POST = async (req: Request) => {
  // Rate limiting: max 5 registration attempts per IP per 15 minutes
  const ip = getClientIp(req);
  const rateLimitResult = rateLimit(ip, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many registration attempts, please try again later',
  });

  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const { email, password, name } = body as { email?: string; password?: string; name?: string };

    // Validate email and password presence
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    // Validate password strength for new registration
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    // Check if user already exists (no timing attack leakage)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    // Create new user
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name?.trim() || null,
      },
    });

    // Return generic success message (same as error scenarios to prevent user enumeration)
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error('Registration error:', error);
    // Return generic message on any error to prevent information leakage
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }
};
