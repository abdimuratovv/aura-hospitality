import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';

const RESULT_LIMIT = 4;

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ transactions: [], employees: [], fraudCases: [], alerts: [] });
  }

  const propertyIds = await getAccessiblePropertyIds(session.id);
  const insensitive = { contains: q, mode: 'insensitive' };

  const [transactions, employees, fraudCases, alerts] = await Promise.all([
    prisma.transaction.findMany({
      where: { propertyId: { in: propertyIds }, OR: [{ folioId: insensitive }, { agent: insensitive }] },
      take: RESULT_LIMIT,
      orderBy: { postedAt: 'desc' },
      include: { property: true },
    }),
    prisma.employee.findMany({
      where: { propertyId: { in: propertyIds }, OR: [{ name: insensitive }, { role: insensitive }] },
      take: RESULT_LIMIT,
      orderBy: { riskScore: 'desc' },
    }),
    prisma.fraudCase.findMany({
      where: { propertyId: { in: propertyIds }, OR: [{ pattern: insensitive }, { agent: insensitive }] },
      take: RESULT_LIMIT,
      orderBy: { confidence: 'desc' },
    }),
    prisma.alert.findMany({
      where: { OR: [{ title: insensitive }, { meta: insensitive }] },
      take: RESULT_LIMIT,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    transactions: transactions.map((t) => ({ id: t.id, folioId: t.folioId, type: t.type, agent: t.agent, property: t.property.shortName })),
    employees: employees.map((e) => ({ id: e.id, name: e.name, role: e.role })),
    fraudCases: fraudCases.map((c) => ({ id: c.id, pattern: c.pattern, agent: c.agent })),
    alerts: alerts.map((a) => ({ id: a.id, title: a.title, severity: a.severity })),
  });
}
