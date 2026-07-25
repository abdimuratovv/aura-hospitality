import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { defaultProperty: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    defaultProperty: user.defaultProperty ? { code: user.defaultProperty.code, name: user.defaultProperty.name } : null,
    twoFactorEnabled: user.twoFactorEnabled,
    criticalAlertsEmail: user.criticalAlertsEmail,
    weeklyDigest: user.weeklyDigest,
  });
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const data = {};

  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.twoFactorEnabled === 'boolean') data.twoFactorEnabled = body.twoFactorEnabled;
  if (typeof body.criticalAlertsEmail === 'boolean') data.criticalAlertsEmail = body.criticalAlertsEmail;
  if (typeof body.weeklyDigest === 'boolean') data.weeklyDigest = body.weeklyDigest;

  const user = await prisma.user.update({
    where: { id: session.id },
    data,
    include: { defaultProperty: true },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    defaultProperty: user.defaultProperty ? { code: user.defaultProperty.code, name: user.defaultProperty.name } : null,
    twoFactorEnabled: user.twoFactorEnabled,
    criticalAlertsEmail: user.criticalAlertsEmail,
    weeklyDigest: user.weeklyDigest,
  });
}
