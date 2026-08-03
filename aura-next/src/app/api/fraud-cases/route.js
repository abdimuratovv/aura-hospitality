import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds, resolvePropertyIds } from '@/lib/access.js';
import { serializeFraudCase } from '@/lib/serializers.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accessibleIds = await getAccessiblePropertyIds(session.id);
  const propertyIds = resolvePropertyIds(accessibleIds, searchParams.get('propertyId'));

  const cases = await prisma.fraudCase.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { confidence: 'desc' },
    include: { property: true },
  });

  return NextResponse.json({ rows: cases.map(serializeFraudCase) });
}
