import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';
import { serializeFraudCase } from '@/lib/serializers.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const propertyIds = await getAccessiblePropertyIds(session.id);

  const cases = await prisma.fraudCase.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { confidence: 'desc' },
    include: { property: true },
  });

  return NextResponse.json({ rows: cases.map(serializeFraudCase) });
}
