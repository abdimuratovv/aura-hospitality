import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const run = await prisma.nightAuditRun.findFirst({
    orderBy: { date: 'desc' },
    include: { checklist: { orderBy: { order: 'asc' } } },
  });

  if (!run) {
    return NextResponse.json({ run: null });
  }

  return NextResponse.json({
    run: {
      id: run.id,
      date: run.date,
      closeStepsCompleted: run.closeStepsCompleted,
      closeStepsTotal: run.closeStepsTotal,
      openDiscrepancies: run.openDiscrepancies,
      discrepancyAmount: Number(run.discrepancyAmount),
      revenuePosted: Number(run.revenuePosted),
      transactionCount: run.transactionCount,
      closeProgressPct: run.closeProgressPct,
      estCompletionLabel: run.estCompletionLabel,
      checklist: run.checklist.map((c) => ({
        id: c.id,
        label: c.label,
        detail: c.detail,
        meta: c.meta,
        status: c.status,
      })),
    },
  });
}
