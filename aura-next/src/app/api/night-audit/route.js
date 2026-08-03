import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds, resolvePropertyIds } from '@/lib/access.js';
import { serializeNightAuditRun } from '@/lib/serializers.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accessibleIds = await getAccessiblePropertyIds(session.id);
  const propertyIds = resolvePropertyIds(accessibleIds, searchParams.get('propertyId'));

  const run = await prisma.nightAuditRun.findFirst({
    where: { propertyId: { in: propertyIds } },
    orderBy: { date: 'desc' },
    include: { checklist: { orderBy: { order: 'asc' } } },
  });

  if (!run) {
    return NextResponse.json({ run: null });
  }

  return NextResponse.json({ run: serializeNightAuditRun(run) });
}
