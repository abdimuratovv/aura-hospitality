import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 20)) : undefined;

  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({
    rows: alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      meta: a.meta,
      source: a.source,
      createdAt: a.createdAt,
    })),
  });
}
