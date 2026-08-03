import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '8', 10) || 8));

  const propertyIds = await getAccessiblePropertyIds(session.id);
  const where = { propertyId: { in: propertyIds } };

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { property: true },
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    rows: rows.map((t) => ({
      id: t.id,
      folioId: t.folioId,
      postedAt: t.postedAt,
      type: t.type,
      agent: t.agent,
      amount: Number(t.amount),
      flag: t.flag,
      property: { code: t.property.code, name: t.property.name },
    })),
    total,
    page,
    pageSize,
  });
}
