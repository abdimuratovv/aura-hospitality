import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const employees = await prisma.employee.findMany({
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
