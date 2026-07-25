import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cases = await prisma.fraudCase.findMany({
    orderBy: { confidence: 'desc' },
    include: { property: true },
  });

  return NextResponse.json({
    rows: cases.map((c) => ({
      id: c.id,
      severity: c.severity,
      pattern: c.pattern,
      agent: c.agent,
      confidence: c.confidence,
      amount: Number(c.amount),
      property: { code: c.property.code, name: c.property.shortName },
    })),
  });
}
