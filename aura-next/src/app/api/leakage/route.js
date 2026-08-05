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

  const rows = await prisma.leakageCategory.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { order: 'asc' },
  });

  // Each in-scope property has its own 5-row breakdown sharing the same
  // category/order/pct — grouping by category name reconstructs a single
  // breakdown, portfolio-wide when multiple properties are in scope or that
  // property's own numbers when narrowed to one via ?propertyId=.
  const byCategory = new Map();
  for (const r of rows) {
    const existing = byCategory.get(r.category);
    if (existing) {
      existing.amount += Number(r.amount);
      existing.recovered += Number(r.recovered);
    } else {
      byCategory.set(r.category, {
        category: r.category,
        amount: Number(r.amount),
        recovered: Number(r.recovered),
        pct: r.pct,
        order: r.order,
      });
    }
  }
  const categories = [...byCategory.values()].sort((a, b) => a.order - b.order);

  const identified = categories.reduce((sum, c) => sum + c.amount, 0);
  const recovered = categories.reduce((sum, c) => sum + c.recovered, 0);
  const recoveryRatePct = Math.round((recovered / identified) * 1000) / 10;

  return NextResponse.json({
    identified,
    recovered,
    recoveryRatePct,
    categories: categories.map((c) => ({
      id: c.category,
      category: c.category,
      amount: c.amount,
      recovered: c.recovered,
      recoveryRatePct: Math.round((c.recovered / c.amount) * 1000) / 10,
      pct: c.pct,
    })),
  });
}
