import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds, resolvePropertyIds } from '@/lib/access.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accessibleIds = await getAccessiblePropertyIds(session.id);
  const propertyIds = resolvePropertyIds(accessibleIds, searchParams.get('propertyId'));

  const employees = await prisma.employee.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { riskScore: 'desc' },
    include: { property: true },
  });

  return NextResponse.json({
    rows: employees.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
      lastActivityAt: e.lastActivityAt,
      riskScore: e.riskScore,
      band: e.band,
      property: { code: e.property.code, name: e.property.shortName },
    })),
  });
}
