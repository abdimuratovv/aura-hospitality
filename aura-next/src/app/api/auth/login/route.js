import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db.js';
import { createSession } from '@/lib/session.js';
import { isRateLimited, recordFailure, clearRateLimit } from '@/lib/rateLimit.js';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `${ip}:${email}`;

  if (isRateLimited(rateLimitKey, { max: MAX_ATTEMPTS, windowMs: WINDOW_MS })) {
    return NextResponse.json({ error: 'Too many failed attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    recordFailure(rateLimitKey, { windowMs: WINDOW_MS });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  clearRateLimit(rateLimitKey);
  await createSession(user);

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
