import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const propertyIds = await getAccessiblePropertyIds(session.id);

  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    rows: properties.map((p) => ({ id: p.id, code: p.code, name: p.name, shortName: p.shortName })),
  });
}
