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
  // Recovered amount comes from postings back to the ledger, not the identified-leakage
  // categories above — there's no dedicated model for that yet, so this stays a fixed
  // figure matching the original mock until a real recovery-tracking table exists.
  const recovered = 71340;
  const recoveryRatePct = Math.round((recovered / identified) * 1000) / 10;

  return NextResponse.json({
    identified,
    recovered,
    recoveryRatePct,
    categories: categories.map((c) => ({
      id: c.id,
      category: c.category,
      amount: Number(c.amount),
      pct: c.pct,
    })),
  });
}
