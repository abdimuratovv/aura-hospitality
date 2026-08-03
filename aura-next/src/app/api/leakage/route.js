import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await prisma.leakageCategory.findMany({ orderBy: { order: 'asc' } });

  const identified = categories.reduce((sum, c) => sum + Number(c.amount), 0);
  const recovered = categories.reduce((sum, c) => sum + Number(c.recovered), 0);
  const recoveryRatePct = Math.round((recovered / identified) * 1000) / 10;

  return NextResponse.json({
    identified,
    recovered,
    recoveryRatePct,
    categories: categories.map((c) => {
      const amount = Number(c.amount);
      const catRecovered = Number(c.recovered);
      return {
        id: c.id,
        category: c.category,
        amount,
        recovered: catRecovered,
        recoveryRatePct: Math.round((catRecovered / amount) * 1000) / 10,
        pct: c.pct,
      };
    }),
  });
}
