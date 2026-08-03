import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds, resolvePropertyIds } from '@/lib/access.js';
import { serializeAlert } from '@/lib/serializers.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 20)) : undefined;

  const accessibleIds = await getAccessiblePropertyIds(session.id);
  const propertyIds = resolvePropertyIds(accessibleIds, searchParams.get('propertyId'));

  const alerts = await prisma.alert.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ rows: alerts.map(serializeAlert) });
}
